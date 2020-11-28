import css from 'styled-jsx/css'

export const Button = props => (
  <button className='test'>
    {props.children}
    <style jsx>{`
      button {
        display: block;
        color: rgb(18, 30, 102);
        background-color: ${props.theme.background};
        display: block;
      }
    `}</style>
    <style jsx global>{`
      .test {
        font-size: large;

        &:hover {
          color: red;
        }
      }
    `}</style>
    <style global jsx>
      {`
        button {
          display: block;
          position: relative;
          color: rgb(199, 104, 104);
          padding: ${'large' in props ? '50' : '20'}px;
          display: block;
          background: ${props.theme.background};
        }
      `}
    </style>
  </button>
)

// Scoped styles
export const button = css`
  button {
    color: hotpink;
    display: block;
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
