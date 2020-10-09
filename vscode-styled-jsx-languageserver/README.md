# vscode-styled-jsx-languageserver

[Main GitHub Repo](https://github.com/Divlo/vscode-styled-jsx/).

Language server for [styled-jsx](https://github.com/zeit/styled-jsx).

## Prerequisites

The extension requires that [vscode-styled-jsx-syntax](https://github.com/Divlo/vscode-styled-jsx/vscode-styled-jsx-syntax) is installed. The extension will not work without it, because it converts template literals to language which can be detected by language server.

## How it works

Consider this component:

```jsx
const Button = props => (
  <button>
    {props.children}
    <style jsx>{`
      button {
        color: #999;
        display: inline-block;
        font-size: 2em;
      }
    `}</style>
    <style jsx>{`
      button {
        padding: ${'large' in props ? '50' : '20'}px;
        position: relative;
        background: ${props.theme.background};
      }
    `}</style>
  </button>
)
```

All the surrounding JSX will be removed, leaving just the CSS:

```




        button {
          color: #999;
          display: inline-block;
          font-size: 2em;
        }


        button {

          position: relative;

        }




```

The reason for this is to preserve line numbers for the language server in order
to correctly propose completions, underline problems and highlight symbols.

## Features

It should provide all the features that simply opening a `.css` file would:

- `CSS` code completion

  ![css-completion](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/completion.gif)

- Hovers

  ![hover](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/hover.gif)

- Color picker

  ![color-picker](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/color-picker.gif)

- Linting

  ![lint](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/linting.gif)

- Quick fixes

  ![quick-fixes](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/quick-fixes.gif)

- Multiple `<style jsx/>` tags in file

  ![multiple-styled-jsx](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/multiple-styled-jsx.png)

- External styles `styled-jsx/css`

  ![external-styles](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/external-styles.png)

## Caveats

- Template literal expressions are replaced with whitespace.
