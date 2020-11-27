import * as vscode from 'vscode'
import * as assert from 'assert'

import { getDocUri, testHover } from './helper'

test('On Hover show CSS information', async () => {
  const highlightUri = getDocUri('highlight.js')
  const multiLineUri = getDocUri('multi-line.tsx')
  const normalUri = getDocUri('normal.jsx')

  assert.strictEqual(
    await testHover(
      highlightUri,
      new vscode.Position(8, 7),
      "In combination with 'float' and 'position', determines"
    ),
    true
  )

  assert.strictEqual(
    await testHover(
      multiLineUri,
      new vscode.Position(6, 12),
      "Sets the color of an element's text"
    ),
    true
  )

  assert.strictEqual(
    await testHover(
      normalUri,
      new vscode.Position(21, 15),
      'The position CSS property sets how an element is positioned'
    ),
    true
  )
})
