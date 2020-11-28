import css from 'styled-jsx/css'

export const Button = props => (
  <button>
    {props.children}
    {/* Support SCSS syntax */}
    <style jsx>{`
      button {
        color: #333;

        &:hover {
          color: #000;
        }
      }
    `}</style>
    <style jsx>
      {`
        button {
          color: rgb(155, 84, 84);
          display: inline-block;
          font-size: 2em;
          position: ;
        }
      `}
    </style>
    <style jsx global>{`
      button {
        padding: ${'large' in props ? '50' : '20'}px;
        position: relative;
        background: ${props.theme.background};
      }
    `}</style>
  </button>
)

// Scoped styles
export const button = css`
  button {
    color: hotpink;
  }
`

// Global styles
export const body = css.global`
  body {
    margin: 0;
  }
`

// Resolved styles
export const link = css.resolve`
  a {
    color: green;
  }
`
