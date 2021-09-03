import DB from '../../config/db'
import { StyleType } from './style-type'
import { RowDataPacket } from 'mysql2'
import Data from '../../data/data'
import DIContainer from '../../config/inversify.config'
import { injectable } from 'inversify'

@injectable()
export default class StyleModel {
  db = DIContainer.get(DB)

  saveStyle = async (userId: number, list: number[]): Promise<void> => {
    const sql = 'INSERT INTO user_style(user_id, style_id) VALUES :value'

    const value = list.map((styleId) => {
      return [userId, styleId]
    })

    await this.db.query(sql, { value })
  }

  deleteStyle = async (userId: number): Promise<void> => {
    const sql = 'DELETE FROM user_style WHERE user_id=:userId'

    const value = { userId }

    await this.db.query(sql, value)
  }

  getUserStyle = async (userId: number): Promise<StyleType[]> => {
    const sql = 'SELECT style_id as id FROM user_style WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return Data.getStyleItemList(rows.map((row) => row.id))
  }

  getUserStyleOnlyValue = async (userId: number): Promise<string[]> => {
    return (await this.getUserStyle(userId)).map((item) => item.value)
  }
}
