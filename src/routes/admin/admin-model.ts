import db from '../../config/db'
import { RowDataPacket } from 'mysql2'

export default class AdminModel {
  getSupplierList = async (): Promise<
    {
      id: number
      name: string
      gender: string
      email: string
      price: number
      supplyGender: number
      status: number
      profile: string
      onboard: string
      introduction: string
      create_time: Date
      update_time: Date
    }[]
  > => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT s.user_id as id, s.price, s.supplyGender, s.status, u.name, u.gender, u.email, u.img, u.profile, u.onboard, u.introduction, u.create_time, u.update_time FROM suppliers s
LEFT JOIN users u ON u.user_id = s.user_id
WHERE s.status = -1`
      const [rows] = await connection.query(sql)
      return rows as any
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getPaymentList = async (): Promise<
    {
      id: number
      supplier: {
        id: number
        name: string
      }
      demander: {
        id: number
        name: string
      }
      status: number
      payName: string
    }[]
  > => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT p.payment_id AS id, p.status, p.data AS payName, ud.user_id AS Did, ud.name AS Dname, us.user_id AS Sid, us.name AS Sname FROM payments p
LEFT JOIN room_user rd ON rd.room_id = p.room_id AND rd.user_type='D'
LEFT JOIN users ud ON ud.user_id = rd.user_id
LEFT JOIN room_user rs ON rs.room_id = p.room_id AND rs.user_type='S'
LEFT JOIN users us ON us.user_id = rs.user_id
where p.status = 1`
      const [rows] = (await connection.query(sql)) as RowDataPacket[]
      return rows.map((row) => {
        const { id, status, payName, Did, Dname, Sid, Sname } = row
        return {
          id,
          status,
          payName,
          demander: {
            id: Did,
            name: Dname,
          },
          supplier: {
            id: Sid,
            name: Sname,
          },
        }
      })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  acceptSupplier = async (id: number, career: number): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE suppliers SET status=:career WHERE user_id=:id `
      const [rows] = await connection.query(sql, { id, career })
      return rows as any
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  acceptPaymentAccount = async (id: number): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE payments SET status=2, pay_time=NOW() WHERE payment_id=:id `
      const [rows] = await connection.query(sql, { id })
      return rows as any
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getRoomIdByPaymentId = async (paymentId: number): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT room_id FROM payments WHERE payment_id = :paymentId`
      const [rows] = await connection.query(sql, { paymentId })
      return rows[0].room_id
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
