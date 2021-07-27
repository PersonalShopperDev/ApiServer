import db from '../../config/db'
import ChatSocket from '../chat/chat-socket'

export default class ChatModel {
  checkEstimate = async (
    userId: number,
    estimateId: number,
  ): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT * FROM estimates e 
LEFT JOIN room_user r ON r.room_id = e.room_id 
WHERE e.estimate_id = :estimateId AND r.user_id = :userId`

      const value = { userId, estimateId }

      const [rows] = await connection.query(sql, value)

      if (rows[0] == null) return false
      return true
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  setPayer = async (estimateId: number, name: string): Promise<void> => {
    const connection = await db.getConnection()
    try {
      if (!(await ChatSocket.getInstance().onChangeStatus(estimateId, 3))) {
        return
      }

      const sql = `UPDATE estimates SET payer=:name WHERE estimate_id = :estimateId`
      const value = { estimateId, name }
      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
