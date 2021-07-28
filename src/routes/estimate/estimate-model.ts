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

  getList = async (
    userId: number,
    page: number,
  ): Promise<
    {
      estimateId: number
      status: number
      price: number
      paymentTime: Date
      userId: number
      name: string
      img: string
    }[]
  > => {
    const connection = await db.getConnection()
    const pageAmount = 20

    try {
      const sql = `SELECT e.estimate_id AS estimateId, e.status, e.price, e.pay_time AS paymentTime, u.user_id as userId, u.name, u.img FROM estimates e
LEFT JOIN room_user r ON e.room_id = r.room_id
LEFT JOIN room_user tr ON tr.room_id = r.room_id
LEFT JOIN users u ON u.user_id = tr.user_id
WHERE r.user_id = :userId AND tr.user_id != :userId AND e.status >= 4
ORDER BY e.update_time DESC
LIMIT :pageOffset, :pageAmount;
`
      const value = { userId, pageAmount, pageOffset: page * pageAmount }
      const [rows] = await connection.query(sql, value)

      return rows as any
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  setPayer = async (
    estimateId: number,
    userId: number,
    name: string,
  ): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      if (
        !(await ChatSocket.getInstance().changeStatus(estimateId, userId, 3))
      ) {
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
      if (!(await ChatSocket.getInstance().changeStatus(estimateId, null, 4))) {
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

  confirmCoord = async (
    userId: number,
    estimateId: number,
  ): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      if (
        !(await ChatSocket.getInstance().changeStatus(estimateId, userId, 5))
      ) {
        return false
      }

      const sql = `UPDATE coords c, 
(SELECT MAX(coord_id) AS coord_id FROM coords WHERE estimate_id=:estimateId GROUP BY estimate_id) AS cc 
SET c.status=1
WHERE c.coord_id = cc.coord_id`

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
