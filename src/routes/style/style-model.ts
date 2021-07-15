import db from '../../config/db'
import { StyleType } from './style-type'
import { RowDataPacket } from 'mysql2'
import Data from '../../data/data'

export default class StyleModel {
  saveStyle = async (userId: number, list: number[]): Promise<void> => {
    const connection = await db.getConnection()
    const sql = 'INSERT INTO user_style(user_id, style_id) VALUES :value'

    const value = list.map((styleId) => {
      return [userId, styleId]
    })

    await connection.query(sql, { value })
    connection.release()
  }

  deleteStyle = async (userId: number): Promise<void> => {
    const connection = await db.getConnection()
    const sql = 'DELETE FROM user_style WHERE user_id=:userId'

    const value = { userId }

    await connection.query(sql, value)
    connection.release()
  }

  static getUserStyle = async (userId: number): Promise<StyleType[]> => {
    const connection = await db.getConnection()
    const sql = 'SELECT style_id as id FROM user_style WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]
    connection.release()

    return Data.getStyleItemList(rows as { id: number }[])
  }

  static getUserStyleOnlyValue = async (userId: number): Promise<string[]> => {
    return (await StyleModel.getUserStyle(userId)).map((item) => item.value)
  }
}
