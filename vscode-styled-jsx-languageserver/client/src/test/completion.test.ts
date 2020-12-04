import * as vscode from 'vscode'
import * as assert from 'assert'
import { getDocUri, testCompletion } from './helper'

const displayCompletionList = {
  items: [
    { label: 'block', kind: vscode.CompletionItemKind.Value },
    { label: 'inline', kind: vscode.CompletionItemKind.Value },
    { label: 'inline-block', kind: vscode.CompletionItemKind.Value },
    { label: 'flex', kind: vscode.CompletionItemKind.Value },
    { label: 'grid', kind: vscode.CompletionItemKind.Value }
  ]
}

test('Completes CSS in styled-jsx component', async () => {
  const defaultUri = getDocUri('default.js')
  const highlightUri = getDocUri('highlight.js')
  const multiLineUri = getDocUri('multi-line.tsx')
  const normalUri = getDocUri('normal.jsx')

  assert.strictEqual(
    await testCompletion(highlightUri, new vscode.Position(7, 11), {
      items: [
        { label: 'blue', kind: vscode.CompletionItemKind.Color },
        { label: 'red', kind: vscode.CompletionItemKind.Color },
        { label: 'yellow', kind: vscode.CompletionItemKind.Color }
      ]
    }),
    true
  )

  assert.strictEqual(
    await testCompletion(
      multiLineUri,
      new vscode.Position(14, 18),
      displayCompletionList
    ),
    true
  )

  assert.strictEqual(
    await testCompletion(
      defaultUri,
      new vscode.Position(4, 12),
      displayCompletionList
    ),
    true
  )

  assert.strictEqual(
    await testCompletion(normalUri, new vscode.Position(21, 19), {
      items: [
        { label: 'absolute', kind: vscode.CompletionItemKind.Value },
        { label: 'relative', kind: vscode.CompletionItemKind.Value },
        { label: 'fixed', kind: vscode.CompletionItemKind.Value }
      ]
    }),
    true
  )
})
