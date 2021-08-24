import { ChatUserProfile, Payment } from '../chat/chat-type'
import ResourcePath from '../resource/resource-path'
import db from '../../config/db'
import { RowDataPacket } from 'mysql2'

export default class PaymentModel {
  getPaymentList = async (
    userId: number,
    page: number,
  ): Promise<
    {
      paymentId: number
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
      const sql = `SELECT p.payment_id AS paymentId, p.status, p.price, p.pay_time AS paymentTime, u.user_id as userId, u.name, u.img FROM payments p
LEFT JOIN room_user r ON p.room_id = r.room_id
LEFT JOIN room_user tr ON tr.room_id = r.room_id
LEFT JOIN users u ON u.user_id = tr.user_id
WHERE r.user_id = :userId AND tr.user_id != :userId AND p.status >= 2
ORDER BY p.update_time DESC
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

  createPayment = async (roomId: number, userId: number): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO payments(room_id, price, status) SELECT :roomId, price, 1 FROM suppliers WHERE user_id=:userId`

      const value = { roomId, userId }
      const [result] = (await connection.query(sql, value)) as RowDataPacket[]
      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getProfile = async (
    userId: number,
  ): Promise<{
    account: string | undefined
    bank: string | undefined
  }> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT profile FROM users WHERE user_id=:userId`

      const value = { userId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      if (rows[0] == null) return { bank: undefined, account: undefined }
      return rows[0].profile
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  completeAccount = async (paymentId: number, name: string): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE payments SET type='account', data=:name WHERE payment_id=:paymentId`

      const value = { paymentId, name }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
