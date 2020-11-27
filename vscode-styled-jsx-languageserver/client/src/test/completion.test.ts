import * as vscode from 'vscode'
import * as assert from 'assert'
import { getDocUri, testCompletion } from './helper'

suite('Should do completion', () => {
  const highlightUri = getDocUri('highlight.js')
  const multiLineUri = getDocUri('multi-line.tsx')
  const normalUri = getDocUri('normal.jsx')

  test('Completes CSS in styled-jsx component', async () => {
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
      await testCompletion(multiLineUri, new vscode.Position(14, 18), {
        items: [
          { label: 'block', kind: vscode.CompletionItemKind.Value },
          { label: 'inline', kind: vscode.CompletionItemKind.Value },
          { label: 'inline-block', kind: vscode.CompletionItemKind.Value },
          { label: 'flex', kind: vscode.CompletionItemKind.Value },
          { label: 'grid', kind: vscode.CompletionItemKind.Value }
        ]
      }),
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
})
