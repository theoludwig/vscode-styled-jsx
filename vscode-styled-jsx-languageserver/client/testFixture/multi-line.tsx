const Header = () => (
  <div>
    <h1>Header</h1>
    <style jsx>
      {`
        h1 {
          color: red;
        }
      `}
    </style>
    <div>
      <h1>Header</h1>
      <style jsx>{`
        .root {
          max-width: 760px;
          padding-top: 5px;
        }
      `}</style>
    </div>
  </div>
)
