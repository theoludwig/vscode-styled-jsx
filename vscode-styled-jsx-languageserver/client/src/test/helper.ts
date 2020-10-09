/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode'
import * as path from 'path'

export let doc: vscode.TextDocument
export let editor: vscode.TextEditor
export let documentEol: string
export let platformEol: string

/**
 * Activates the extension
 */
export async function activate (docUri: vscode.Uri): Promise<void> {
  // The extensionId is `publisher.name` from package.json
  const ext = vscode.extensions.getExtension('divlo.vscode-styled-jsx-languageserver')
  await ext.activate()
  try {
    doc = await vscode.workspace.openTextDocument(docUri)
    editor = await vscode.window.showTextDocument(doc)
    await sleep(2000) // Wait for server activation
  } catch (e) {
    console.error(e)
  }
}

async function sleep (ms: number): Promise<unknown> {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

export const getDocPath = (p: string): string => {
  return path.resolve(__dirname, '../../testFixture', p)
}
export const getDocUri = (p: string): vscode.Uri => {
  return vscode.Uri.file(getDocPath(p))
}

export async function setTestContent (content: string): Promise<boolean> {
  const all = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length)
  )
  return await editor.edit(eb => eb.replace(all, content))
}
