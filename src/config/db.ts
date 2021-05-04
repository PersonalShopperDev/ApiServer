import mysql from 'mysql2/promise'

export default mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABSE,
  queryFormat: (query, values) => {
    if (!values) return query
    const resultQuery = query.replace(/:(\w+)/g, (txt, key) => {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        txt = mysql.escape(values[key])
      }
      return txt
    })
    if (process.env.MODE === 'development') console.log(resultQuery)
    return resultQuery
  },
})
