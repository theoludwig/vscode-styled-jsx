<h1 align="center">vscode-styled-jsx</h1>

<p align="center">
  <strong><a href="https://code.visualstudio.com/">Visual Studio Code</a> syntax highlighting and auto-completion for <a href="https://www.npmjs.com/package/styled-jsx">styled-jsx</a>.</strong>
</p>

<p align="center">
  <a href="https://github.com/Divlo/vscode-styled-jsx/actions?query=workflow%3A%22Node.js+CI%22"><img src="https://github.com/Divlo/vscode-styled-jsx/workflows/Node.js%20CI/badge.svg" alt="Node.js CI" /></a>
  <a href="https://www.npmjs.com/package/ts-standard"><img alt="Typescript Standard Style" src="https://camo.githubusercontent.com/f87caadb70f384c0361ec72ccf07714ef69a5c0a/68747470733a2f2f62616467656e2e6e65742f62616467652f636f64652532307374796c652f74732d7374616e646172642f626c75653f69636f6e3d74797065736372697074"/></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/licence-MIT-blue.svg" alt="Licence MIT"/></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits" /></a>
  <a href="./.github/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg" alt="Contributor Covenant" /></a>
</p>

## 📜 About

All the features of a CSS file inside [Visual Studio Code](https://code.visualstudio.com/) for [styled-jsx](https://www.npmjs.com/package/styled-jsx).

There are two repo maintained by different developers :

- Auto-completion: [styled-jsx Language Server](https://github.com/Grimones/vscode-styled-jsx-languageserver)
- Syntax highlighting: [vscode-styled-jsx](https://github.com/iFwu/vscode-styled-jsx)

Unfortunately, they are abandoned projects and the fact that it is seperated in 2 differents repos makes it hard to contribute and to follow along the updates.

That's why I created this monorepo, to maintain two VS Code extensions :

- [vscode-styled-jsx-languageserver](https://marketplace.visualstudio.com/items?itemName=Divlo.vscode-styled-jsx-languageserver)
- [vscode-styled-jsx-syntax](https://marketplace.visualstudio.com/items?itemName=Divlo.vscode-styled-jsx-syntax)

### How to install ?

- [styled-jsx Syntax Highlighting](https://marketplace.visualstudio.com/items?itemName=Divlo.vscode-styled-jsx-syntax)

  Launch VS Code Quick Open (⌘+P), paste the following command, and press enter.

  ```text
  ext install Divlo.vscode-styled-jsx-syntax
  ```

- [vscode-styled-jsx-languageserver](https://marketplace.visualstudio.com/items?itemName=Divlo.vscode-styled-jsx-languageserver)

  Launch VS Code Quick Open (⌘+P), paste the following command, and press enter.

  ```text
  ext install Divlo.vscode-styled-jsx-languageserver
  ```

## 💡 Contributing

Anyone can help to improve the project, submit a Feature Request, a bug report or even correct a simple spelling mistake.

The steps to contribute can be found in the [CONTRIBUTING.md](./.github/CONTRIBUTING.md) file.

## 📄 License

[MIT](./LICENSE)
