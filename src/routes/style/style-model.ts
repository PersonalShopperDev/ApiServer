import db from '../../config/db'

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
}
