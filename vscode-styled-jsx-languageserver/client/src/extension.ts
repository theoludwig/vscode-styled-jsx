/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
'use strict'

import * as path from 'path'

// vscode.d.ts from https://github.com/Microsoft/vscode/blob/master/src/vs/vscode.d.ts
import {
  languages,
  window,
  commands,
  ExtensionContext,
  ColorInformation,
  ColorPresentation,
  Color,
  Range,
  Position,
  CompletionItem,
  CompletionItemKind,
  TextEdit,
  SnippetString
} from 'vscode'
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient'

import { ConfigurationFeature } from 'vscode-languageclient/lib/configuration'
import {
  DocumentColorRequest,
  DocumentColorParams,
  ColorPresentationRequest,
  ColorPresentationParams
} from 'vscode-languageserver-protocol'

import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()

// this method is called when vs code is activated
export function activate (context: ExtensionContext): void {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join('server', 'out', 'server.js')
  )
  // The debug options for the server
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6004'] }

  // If the extension is launch in debug mode the debug server options are use
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  }

  const documentSelector = [
    'javascriptreact',
    'javascript',
    'typescriptreact',
    'typescript'
  ]

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector,
    synchronize: {
      configurationSection: 'css'
    },
    initializationOptions: {}
  }

  // Create the language client and start the client.
  const client = new LanguageClient(
    'styled.jsx',
    'styled-jsx Language Server',
    serverOptions,
    clientOptions
  )
  client.registerFeature(new ConfigurationFeature(client))

  const disposable = client.start()
  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable)

  client
    .onReady()
    .then(_ => {
      client.code2ProtocolConverter.asPosition(
        window?.activeTextEditor?.selection?.active
      )
      // register color provider
      context.subscriptions.push(
        languages.registerColorProvider(documentSelector, {
          provideDocumentColors (document): Thenable<ColorInformation[]> {
            const params: DocumentColorParams = {
              textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(
                document
              )
            }
            return client
              .sendRequest(DocumentColorRequest.type, params)
              .then(symbols => {
                return symbols.map(symbol => {
                  const range = client.protocol2CodeConverter.asRange(
                    symbol.range
                  )
                  const color = new Color(
                    symbol.color.red,
                    symbol.color.green,
                    symbol.color.blue,
                    symbol.color.alpha
                  )
                  return new ColorInformation(range, color)
                })
              })
          },
          provideColorPresentations (
            color,
            context
          ): ColorPresentation[] | Thenable<ColorPresentation[]> {
            const params: ColorPresentationParams = {
              textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(
                context.document
              ),
              color,
              range: client.code2ProtocolConverter.asRange(context.range)
            }
            return client
              .sendRequest(ColorPresentationRequest.type, params)
              .then(presentations => {
                return presentations.map(p => {
                  const presentation = new ColorPresentation(p.label)
                  presentation.textEdit =
                    p.textEdit != null &&
                    client.protocol2CodeConverter.asTextEdit(p.textEdit)
                  presentation.additionalTextEdits =
                    p.additionalTextEdits != null &&
                    client.protocol2CodeConverter.asTextEdits(
                      p.additionalTextEdits
                    )
                  return presentation
                })
              })
          }
        })
      )
    })
    .catch(() => {})

  const regionCompletionRegExpr = /^(\s*)(\/(\*\s*(#\w*)?)?)?/
  languages.registerCompletionItemProvider(documentSelector, {
    provideCompletionItems (doc, pos) {
      const lineUntilPos = doc.getText(
        new Range(new Position(pos.line, 0), pos)
      )
      const match = lineUntilPos.match(regionCompletionRegExpr)
      if (match != null) {
        const range = new Range(new Position(pos.line, match[1].length), pos)
        const beginProposal = new CompletionItem(
          '#region',
          CompletionItemKind.Snippet
        )
        beginProposal.range = range
        TextEdit.replace(range, '/* #region */')
        beginProposal.insertText = new SnippetString('/* #region $1*/')
        beginProposal.documentation = localize(
          'folding.start',
          'Folding Region Start'
        )
        beginProposal.filterText = match[2]
        beginProposal.sortText = 'za'
        const endProposal = new CompletionItem(
          '#endregion',
          CompletionItemKind.Snippet
        )
        endProposal.range = range
        endProposal.insertText = '/* #endregion */'
        endProposal.documentation = localize(
          'folding.end',
          'Folding Region End'
        )
        endProposal.sortText = 'zb'
        endProposal.filterText = match[2]
        return [beginProposal, endProposal]
      }
      return null
    }
  })

  commands.registerCommand('styled.jsx.applyCodeAction', applyCodeAction)
  // FIXME: don't know how to correctly test this
  function applyCodeAction (
    uri: string,
    documentVersion: number,
    edits: TextEdit[]
  ): void {
    const textEditor = window.activeTextEditor
    if (textEditor != null && textEditor.document.uri.toString() === uri) {
      if (textEditor.document.version !== documentVersion) {
        // eslint-disable-next-line
        window.showInformationMessage(
          "CSS fix is outdated and can't be applied to the document."
        )
      }
      // eslint-disable-next-line
      textEditor
        .edit(mutator => {
          for (const edit of edits) {
            mutator.replace(
              client.protocol2CodeConverter.asRange(edit.range),
              edit.newText
            )
          }
        })
        // eslint-disable-next-line
        .then(success => {
          if (!success) {
            // eslint-disable-next-line
            window.showErrorMessage(
              'Failed to apply CSS fix to the document. Please consider opening an issue with steps to reproduce.'
            )
          }
        })
    }
  }
}
