import { ChatUserProfile } from '../chat/chat-type'
import ResourcePath from '../resource/resource-path'
import db from '../../config/db'
import { RowDataPacket } from 'mysql2'

export default class PaymentModel {
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
