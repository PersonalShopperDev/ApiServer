import db from '../../config/db'
import ChatSocket from '../chat/chat-socket'

export default class ChatModel {
  checkEstimate = async (
    userId: number,
    estimateId: number,
  ): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT estimate_id, status FROM estimates e 
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

  setPayer = async (estimateId: number, name: string): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      if (!(await ChatSocket.getInstance().changeStatus(estimateId, 3))) {
        return false
      }

      const sql = `UPDATE estimates SET payer=:name WHERE estimate_id = :estimateId`
      const value = { estimateId, name }
      await connection.query(sql, value)
      return true
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  setPayment = async (estimateId: number): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      if (!(await ChatSocket.getInstance().changeStatus(estimateId, 4))) {
        return false
      }

      const sql = `UPDATE estimates SET pay_time=NOW() WHERE estimate_id = :estimateId`
      const value = { estimateId }
      await connection.query(sql, value)
      return true
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
