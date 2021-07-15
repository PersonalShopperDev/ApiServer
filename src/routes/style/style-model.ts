import db from '../../config/db'
import { StyleType } from './style-type'
import { RowDataPacket } from 'mysql2'
import Data from '../../data/data'

export default class StyleModel {
  saveStyle = async (userId: number, list: number[]): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = 'INSERT INTO user_style(user_id, style_id) VALUES :value'

      const value = list.map((styleId) => {
        return [userId, styleId]
      })

      await connection.query(sql, { value })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  deleteStyle = async (userId: number): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = 'DELETE FROM user_style WHERE user_id=:userId'

      const value = { userId }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  static getUserStyle = async (userId: number): Promise<StyleType[]> => {
    const connection = await db.getConnection()
    try {
      const sql = 'SELECT style_id as id FROM user_style WHERE user_id=:userId'

      const value = { userId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return Data.getStyleItemList(rows.map((row) => row.id))
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  static getUserStyleOnlyValue = async (userId: number): Promise<string[]> => {
    return (await StyleModel.getUserStyle(userId)).map((item) => item.value)
  }
}
