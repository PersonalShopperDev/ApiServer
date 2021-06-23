import db from '../../config/db'
import { femaleStyleList, maleStyleList, StyleType } from './style-type'

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
    const sql =
      'SELECT json_arrayagg(style_id) as arr FROM user_style WHERE user_id=:userId GROUP BY user_id'

    const value = { userId }

    const [rows] = await connection.query(sql, value)
    connection.release()

    return rows[0].arr.map((id) => {
      return {
        id,
        value: StyleModel.convertStyleIdToValue(id),
      }
    })
  }

  static convertStyleIdToValue = (styleId: number): string | undefined => {
    const list = styleId % 10 == 2 ? femaleStyleList : maleStyleList
    for (const key in list) {
      if (list[key].id == styleId) {
        return list[key].value
      }
    }
  }
}
