/* styles.js */
import css from 'styled-jsx/css'

/* should be identified as styled jsx style and hightlight */
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

/* shouldn't break original syntax highlight */
const resources = `partials.scss`
