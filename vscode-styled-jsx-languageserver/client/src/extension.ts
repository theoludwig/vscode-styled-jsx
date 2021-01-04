import * as path from 'path'

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
} from 'vscode-languageclient/node'

import {
  DocumentColorRequest,
  DocumentColorParams,
  ColorPresentationRequest,
  ColorPresentationParams
} from 'vscode-languageserver-protocol'

import * as nls from 'vscode-nls'

const localize = nls.loadMessageBundle()

export function activate (context: ExtensionContext): void {
  const serverModule = context.asAbsolutePath(
    path.join('server', 'out', 'server.js')
  )
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6004'] }
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
  const clientOptions: LanguageClientOptions = {
    documentSelector,
    synchronize: {
      configurationSection: 'css'
    },
    initializationOptions: {}
  }
  const client = new LanguageClient(
    'styled.jsx',
    'styled-jsx Language Server',
    serverOptions,
    clientOptions
  )

  const disposable = client.start()
  context.subscriptions.push(disposable)

  client
    .onReady()
    .then(_ => {
      client.code2ProtocolConverter.asPosition(
        window?.activeTextEditor?.selection?.active
      )
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
  async function applyCodeAction (
    uri: string,
    documentVersion: number,
    edits: TextEdit[]
  ): Promise<void> {
    const textEditor = window.activeTextEditor
    if (textEditor != null && textEditor.document.uri.toString() === uri) {
      if (textEditor.document.version !== documentVersion) {
        await window.showInformationMessage(
          "CSS fix is outdated and can't be applied to the document."
        )
      }
      const success = await textEditor.edit(mutator => {
        for (const edit of edits) {
          mutator.replace(
            client.protocol2CodeConverter.asRange(edit.range),
            edit.newText
          )
        }
      })
      if (!success) {
        await window.showErrorMessage(
          'Failed to apply CSS fix to the document. Please consider opening an issue with steps to reproduce.'
        )
      }
    }
  }
}
