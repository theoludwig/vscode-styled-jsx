import * as path from 'path'
import { runTests } from 'vscode-test'

async function main (): Promise<void> {
  const extensionDevelopmentPath = path.resolve(__dirname, '../../../')
  const extensionTestsPath = path.resolve(__dirname, './index')
  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: ['--disable-extensions']
  })
}

main().catch(err => {
  console.error(err)
  console.error('Failed to run tests')
  process.exit(1)
})
