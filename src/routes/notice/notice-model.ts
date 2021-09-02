import { Notice } from './notice-type'
import { RowDataPacket } from 'mysql2'
import DIContainer from '../../config/inversify.config'
import DB from '../../config/db'

export default class NoticeModel {
  db = DIContainer.get(DB)

  getNotice = async (
    userType: string | undefined,
    noticeId: number,
  ): Promise<Notice | null> => {
    const sql = `SELECT notice_id as id, title, content, update_time as date FROM notices
WHERE notice_id = :noticeId
AND status = 1 
${userType != null ? "AND (user_type=:userType OR user_type='A')" : ''}`

    const value = {
      userType: userType == 'W' ? 'S' : userType,
      noticeId,
    }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows[0]
  }

  getNoticeList = async (
    userType: string | undefined,
    page: number,
  ): Promise<Notice[]> => {
    const pageAmount = 20

    const sql = `SELECT notice_id as id, title, update_time as date FROM notices
WHERE status = 1
${userType != null ? "AND (user_type=:userType OR user_type='A')" : ''}
ORDER BY notice_id ASC
LIMIT :pageOffset, :pageAmount;`

    const value = {
      userType: userType == 'W' ? 'S' : userType,
      pageAmount,
      pageOffset: page * pageAmount,
    }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows as Notice[]
  }
}
