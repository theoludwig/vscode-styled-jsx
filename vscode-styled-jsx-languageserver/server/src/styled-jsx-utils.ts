import * as ts from 'typescript'
import { Stylesheet, TextDocument } from 'vscode-css-languageservice'
import { LanguageModelCache } from './language-model-cache'

export interface StyledJsxTaggedTemplate {
  start: number
  end: number
}

export interface StyledJsxTagAttributes {
  firstAttributeName: string | undefined
  secondAttributeName: string | undefined
}

export interface StyledJsx {
  cssDocument: TextDocument
  stylesheet: Stylesheet
}

const styledJsxPattern = /((<\s*?style\s*?(global)?\s*?jsx\s*?(global)?\s*?>)|(\s*?css\s*?`))/g
export function getApproximateStyledJsxOffsets (
  document: TextDocument
): number[] {
  const results = []
  const doc = document.getText()
  // eslint-disable-next-line
  while (styledJsxPattern.exec(doc)) {
    results.push(styledJsxPattern.lastIndex)
  }
  return results
}

// css`button { position: relative; }`
export function isStyledJsxTaggedTemplate (token: ts.Node): boolean {
  return (
    token.parent.kind === ts.SyntaxKind.TaggedTemplateExpression &&
    token.parent.getText().startsWith('css')
  )
}

function walk (node: ts.Node, callback: (node: ts.Node) => void): void {
  if (
    ts.isJSDoc(node) ||
    node.kind === ts.SyntaxKind.MultiLineCommentTrivia ||
    node.kind === ts.SyntaxKind.SingleLineCommentTrivia
  ) {
    return
  }

  if (ts.isToken(node) && node.kind !== ts.SyntaxKind.EndOfFileToken) {
    callback(node)
  } else {
    node.getChildren().forEach(child => walk(child, callback))
  }
}

function getTemplateString (
  node: ts.Node
): ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral | undefined {
  if (ts.isTemplateHead(node) || ts.isTemplateLiteral(node)) {
    if (ts.isTemplateHead(node)) {
      return node.parent
    } else {
      return node
    }
  }
  return undefined
}

function isStyledJsxTemplate (node: ts.Node): boolean {
  if (!ts.isJsxExpression(node.parent)) {
    return false
  }

  const grandparent = node.parent.parent

  if (!ts.isJsxElement(grandparent)) {
    return false
  }

  const opener = grandparent.openingElement

  if (opener.tagName.getText() !== 'style') {
    return false
  }

  for (const prop of opener.attributes.properties) {
    if (prop.name != null && prop.name.getText() === 'jsx') {
      return true
    }
  }

  return false
}

function findStyledJsxTaggedTemplate (
  textDocument: TextDocument
): StyledJsxTaggedTemplate[] {
  const source = ts.createSourceFile(
    'tmp',
    textDocument.getText(),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const templates: StyledJsxTaggedTemplate[] = []
  walk(source, node => {
    const templateNode = getTemplateString(node)
    if (templateNode != null) {
      if (
        isStyledJsxTemplate(templateNode) ||
        isStyledJsxTaggedTemplate(templateNode)
      ) {
        templates.push({
          start: templateNode.getStart() + 1,
          end: templateNode.getEnd() - 1
        })
      }
    }
  })

  return templates
}

const expressionPattern = /(.*\${.*}.*)|(.*(&&|[||]).*)/g
export function replaceAllWithSpacesExceptCss (
  textDocument: TextDocument,
  styledJsxTaggedTemplates: StyledJsxTaggedTemplate[],
  stylesheets: LanguageModelCache<Stylesheet>
): { cssDocument: TextDocument, stylesheet: Stylesheet } {
  const text = textDocument.getText()
  let result = ''
  // Code that goes before CSS
  result += text.slice(0, styledJsxTaggedTemplates[0].start).replace(/./g, ' ')
  for (let i = 0; i < styledJsxTaggedTemplates.length; i++) {
    /* CSS itself with dirty hacks. Maybe there is better solution.
    We need to find all expressions in CSS and replace each character of expression with space.
    This is neccessary to preserve character count */
    result += text
      .slice(styledJsxTaggedTemplates[i].start, styledJsxTaggedTemplates[i].end)
      .replace(expressionPattern, (_str, p1) => {
        return p1.replace(/./g, ' ')
      })
    const hasSeveralCSSParts = i + 1 < styledJsxTaggedTemplates.length
    if (hasSeveralCSSParts) {
      // Code that is in between that CSS parts
      result += text
        .slice(
          styledJsxTaggedTemplates[i].end,
          styledJsxTaggedTemplates[i + 1].start
        )
        .replace(/./g, ' ')
    }
  }
  // Code that goes after CSS
  result += text
    .slice(
      styledJsxTaggedTemplates[styledJsxTaggedTemplates.length - 1].end,
      text.length
    )
    .replace(/./g, ' ')
  const cssDocument = TextDocument.create(
    textDocument.uri.toString(),
    'css',
    textDocument.version,
    result
  )
  const stylesheet = stylesheets.get(cssDocument)
  return {
    cssDocument,
    stylesheet
  }
}

export function getStyledJsx (
  document: TextDocument,
  stylesheets: LanguageModelCache<Stylesheet>
): StyledJsx | undefined {
  try {
    const styledJsxOffsets = getApproximateStyledJsxOffsets(document)
    if (styledJsxOffsets.length > 0) {
      const styledJsxTaggedTemplates = findStyledJsxTaggedTemplate(document)
      if (styledJsxTaggedTemplates.length > 0) {
        return replaceAllWithSpacesExceptCss(
          document,
          styledJsxTaggedTemplates,
          stylesheets
        )
      }
    }
    return undefined
  } catch {
    return undefined
  }
}
