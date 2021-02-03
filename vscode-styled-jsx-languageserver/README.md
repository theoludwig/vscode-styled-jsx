# vscode-styled-jsx-languageserver

[Main GitHub Repo](https://github.com/Divlo/vscode-styled-jsx/).

Language server for [styled-jsx](https://github.com/vercel/styled-jsx).

## Features

- `CSS` code completion

  ![css-completion](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/completion.gif)

- Hovers

  ![hover](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/hover.gif)

- Color picker

  ![color-picker](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/color-picker.gif)

- Quick fixes

  ![quick-fixes](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/quick-fixes.gif)

- Multiple `<style jsx/>` tags in file

  ![multiple-styled-jsx](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/multiple-styled-jsx.png)

- External styles `styled-jsx/css`

  ![external-styles](https://raw.githubusercontent.com/Divlo/vscode-styled-jsx/master/.github/images/external-styles.png)

## How it works

It converts template literals to language which can be detected by language server.

Consider this component:

```jsx
const Button = (props) => (
  <button>
    {props.children}
    <style jsx>{`
      button {
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

```css
button {
  display: inline-block;
  font-size: 2em;
}

button {
  position: relative;
}
```

The reason for this is to preserve line numbers for the language server in order
to correctly propose completions, underline problems and highlight symbols.

## Caveats

- Template literal expressions are replaced with whitespace.
