# 💡 Contributing

Thanks a lot for your interest in contributing to **vscode-styled-jsx**! 🎉

## Types of contributions

- Reporting a bug.
- Suggest a new feature idea.
- Correct spelling errors, improvements or additions to documentation files (README, CONTRIBUTING...).
- Improve structure/format/performance/refactor/tests of the code.

## Pull Requests

- **Please first discuss** the change you wish to make via [issue](https://github.com/Divlo/vscode-styled-jsx/issues) before making a change. It might avoid a waste of your time.

- Ensure your code respect linting.

- Make sure your **code passes the tests**.

If you're adding new features to **vscode-styled-jsx**, please include tests.

## Commits

The commit message guidelines respect [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) and [Semantic Versioning](https://semver.org/) for releases.

### Types

Types define which kind of changes you made to the project.

| Types    | Description                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| feat     | A new feature.                                                                                               |
| fix      | A bug fix.                                                                                                   |
| docs     | Documentation only changes.                                                                                  |
| style    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).      |
| refactor | A code change that neither fixes a bug nor adds a feature.                                                   |
| perf     | A code change that improves performance.                                                                     |
| test     | Adding missing tests or correcting existing tests.                                                           |
| build    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).         |
| ci       | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs). |
| chore    | Other changes that don't modify src or test files.                                                           |
| revert   | Reverts a previous commit.                                                                                   |

### Scopes

Scopes define what part of the code changed.

There are 2 principal scopes in the project :

- syntax
- langserver

### Examples

```sh
git commit -m "feat(langserver): add support for auto-completion"
git commit -m "docs(readme): update installation process"
git commit -m "fix(syntax): correctly hightlight css"
```
