import mysql, { PoolConnection } from 'mysql2/promise'
import { RowDataPacket } from 'mysql2'
import { injectable } from 'inversify'

@injectable()
export default class DB {
  private db = mysql.createPool({
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
      if (process.env.NODE_MODE === 'development') console.log(resultQuery)
      return resultQuery
    },
  })

  async beginTransaction(): Promise<PoolConnection> {
    const connection = await this.db.getConnection()
    await connection.beginTransaction()
    return connection
  }

  async query(sql: string): Promise<RowDataPacket[]>
  async query(sql: string, value: unknown): Promise<RowDataPacket[]>
  async query(
    sql: string,
    value?: unknown | undefined,
  ): Promise<RowDataPacket[]> {
    const connection = await this.db.getConnection()
    try {
      return (await connection.query(sql, value)) as RowDataPacket[]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
