import db from '../../config/db'
import { Notice } from './notice-type'
import { RowDataPacket } from 'mysql2'

export default class NoticeModel {
  getNoticeList = async (
    userType: string | undefined,
    page: number,
  ): Promise<Notice[]> => {
    const connection = await db.getConnection()
    const pageAmount = 20
    try {
      const sql = `SELECT notice_id as id, title, content FROM notices
WHERE status = 1
${userType != null ? "AND (user_type=:userType OR user_type='A')" : ''}
ORDER BY notice_id ASC
LIMIT :pageOffset, :pageAmount;`

      const value = {
        userType: userType == 'W' ? 'S' : userType,
        pageAmount,
        pageOffset: page * pageAmount,
      }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows as Notice[]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
