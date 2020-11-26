import * as vscode from 'vscode'
import * as assert from 'assert'
import { getDocUri, activate } from './helper'

suite('Should do completion', () => {
  const docUri = getDocUri('highlight.js')

  test('Completes CSS in styled-jsx component', async () => {
    await testCompletion(docUri, new vscode.Position(7, 11), {
      items: [
        { label: 'blue', kind: vscode.CompletionItemKind.Color },
        { label: 'red', kind: vscode.CompletionItemKind.Color },
        { label: 'yellow', kind: vscode.CompletionItemKind.Color }
      ]
    })

    await testCompletion(docUri, new vscode.Position(8, 12), {
      items: [
        { label: 'block', kind: vscode.CompletionItemKind.Value },
        { label: 'inline', kind: vscode.CompletionItemKind.Value },
        { label: 'inline-block', kind: vscode.CompletionItemKind.Value },
        { label: 'flex', kind: vscode.CompletionItemKind.Value },
        { label: 'grid', kind: vscode.CompletionItemKind.Value }
      ]
    })
  })
})

function includes (
  actualArray: vscode.CompletionItem[],
  expectedArray: vscode.CompletionItem[]
): boolean {
  const result: boolean[] = []
  expectedArray.forEach(item => {
    const hasItem = actualArray.some(item2 => {
      return item2.kind === item.kind && item2.label === item.label
    })
    if (hasItem) {
      result.push(true)
    }
  })
  return expectedArray.length === result.length
}

async function testCompletion (
  docUri: vscode.Uri,
  position: vscode.Position,
  expectedCompletionList: vscode.CompletionList
): Promise<void> {
  await activate(docUri)
  const actualCompletionList: vscode.CompletionList = await vscode.commands.executeCommand(
    'vscode.executeCompletionItemProvider',
    docUri,
    position
  )
  const actualArrayIncludesExpectedArray = includes(
    actualCompletionList.items,
    expectedCompletionList.items
  )
  assert.strictEqual(actualArrayIncludesExpectedArray, true)
}
