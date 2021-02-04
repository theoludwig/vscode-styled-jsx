import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  DocumentColorRequest,
  ColorPresentationRequest,
  Diagnostic,
  TextDocumentPositionParams,
  HandlerResult,
  DocumentSymbolParams
} from 'vscode-languageserver/node'
import {
  getSCSSLanguageService,
  LanguageSettings,
  Stylesheet
} from 'vscode-css-languageservice'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { getLanguageModelCache } from './language-model-cache'
import { getStyledJsx, StyledJsx } from './styled-jsx-utils'

const connection = createConnection(ProposedFeatures.all)
const textDocuments = new TextDocuments(TextDocument)
const cssLanguageService = getSCSSLanguageService()
const stylesheets = getLanguageModelCache<Stylesheet>(10, 60, textDocument =>
  cssLanguageService.parseStylesheet(textDocument)
)
const validationDelayMs = 200
const pendingValidationRequests: { [uri: string]: NodeJS.Timer } = {}
const defaultSettings: LanguageSettings = {
  validate: false
}
const documentSettings: Map<string, Thenable<LanguageSettings>> = new Map()

async function getDocumentSettings (): Promise<Thenable<LanguageSettings>> {
  return await Promise.resolve(defaultSettings)
}

function cleanPendingValidation (textDocument: TextDocument): void {
  const request = pendingValidationRequests[textDocument.uri]
  if (request != null) {
    clearTimeout(request)
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pendingValidationRequests[textDocument.uri]
  }
}

function triggerValidation (textDocument: TextDocument): void {
  cleanPendingValidation(textDocument)
  pendingValidationRequests[textDocument.uri] = setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pendingValidationRequests[textDocument.uri]
    validateTextDocument(textDocument).catch(() => {})
  }, validationDelayMs)
}

function clearDiagnostics (textDocument: TextDocument): void {
  cleanPendingValidation(textDocument)
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] })
}

async function validateTextDocument (
  textDocument: TextDocument
): Promise<void> {
  const settings = await getDocumentSettings()
  const styledJsx = getStyledJsx(textDocument, stylesheets)
  if (styledJsx != null) {
    const { cssDocument, stylesheet } = styledJsx
    const diagnostics: Diagnostic[] = cssLanguageService
      .doValidation(cssDocument, stylesheet, settings)
      .map(d => {
        return {
          ...d,
          code: d.code
        }
      })
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics })
  } else {
    clearDiagnostics(textDocument)
  }
}

function requestHandler (
  params: TextDocumentPositionParams | DocumentSymbolParams,
  callback: (styledJsx: StyledJsx) => HandlerResult<any, any>
): HandlerResult<any, any> {
  const document = textDocuments.get(params.textDocument.uri)
  if (document == null) {
    return null
  }
  const styledJsx = getStyledJsx(document, stylesheets)
  if (styledJsx != null) {
    return callback(styledJsx)
  }
}

textDocuments.onDidClose(event => {
  documentSettings.delete(event.document.uri)
  stylesheets.onDocumentRemoved(event.document)
  clearDiagnostics(event.document)
})

textDocuments.onDidChangeContent(change => {
  triggerValidation(change.document)
})

connection.onShutdown(() => {
  stylesheets.dispose()
})

connection.onInitialize(initializeParams => {
  const capabilities = initializeParams.capabilities
  const hasWorkspaceFolderCapability =
    capabilities?.workspace?.workspaceFolders != null &&
    capabilities.workspace.workspaceFolders

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      workspace: {
        workspaceFolders: {
          supported: hasWorkspaceFolderCapability
        }
      },
      completionProvider: {
        resolveProvider: true
      },
      hoverProvider: true,
      documentSymbolProvider: true,
      referencesProvider: true,
      definitionProvider: true,
      documentHighlightProvider: true,
      codeActionProvider: true,
      renameProvider: false,
      colorProvider: false
    }
  }
})

connection.onDidChangeConfiguration((async () => {
  cssLanguageService.configure(defaultSettings)
  const textDocumentsAll = textDocuments.all()
  for (const textDocument of textDocumentsAll) {
    await validateTextDocument(textDocument)
  }
}) as unknown as () => void)

connection.onCompletionResolve(item => item)

connection.onCompletion(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.doComplete(
      cssDocument,
      params.position,
      stylesheet
    )
  })
})

connection.onHover(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.doHover(cssDocument, params.position, stylesheet)
  })
})

connection.onDocumentSymbol(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.findDocumentSymbols(cssDocument, stylesheet)
  })
})

connection.onDefinition(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.findDefinition(
      cssDocument,
      params.position,
      stylesheet
    )
  })
})

connection.onDocumentHighlight(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.findDocumentHighlights(
      cssDocument,
      params.position,
      stylesheet
    )
  })
})

connection.onReferences(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.findReferences(
      cssDocument,
      params.position,
      stylesheet
    )
  })
})

connection.onCodeAction(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.doCodeActions(
      cssDocument,
      params.range,
      params.context,
      stylesheet
    )
  })
})

connection.onRequest(DocumentColorRequest.type, params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.findDocumentColors(cssDocument, stylesheet)
  })
})

connection.onRequest(ColorPresentationRequest.type, params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.getColorPresentations(
      cssDocument,
      stylesheet,
      params.color,
      params.range
    )
  })
})

connection.onRenameRequest(params => {
  return requestHandler(params, ({ cssDocument, stylesheet }) => {
    return cssLanguageService.doRename(
      cssDocument,
      params.position,
      params.newName,
      stylesheet
    )
  })
})

textDocuments.listen(connection)
connection.listen()
