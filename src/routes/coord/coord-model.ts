import db from '../../config/db'
import { Cloth, ClothData, Coord, CoordIdData } from './coord-type'
import { RowDataPacket } from 'mysql2'

export default class CoordModel {
  getCoordBase = async (
    userId: number,
    coordId: number,
  ): Promise<{
    title: string
    comment: string
  } | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT c.title, c.comment FROM coords c
JOIN payments e ON e.payment_id = c.payment_id
JOIN room_user r ON r.room_id = e.room_id
WHERE coord_id=:coordId AND r.user_id=:userId`

      const value = { userId, coordId }

      const [rows] = await connection.query(sql, value)

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getClothes = async (coordId: number): Promise<ClothData[]> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT img, name, price, purchase_url as purchaseUrl FROM coord_clothes WHERE coord_id=:coordId`

      const value = { coordId }

      const [rows] = await connection.query(sql, value)

      return rows as ClothData[]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getReference = async (coordId: number): Promise<string[]> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT img FROM coord_references WHERE coord_id=:coordId`

      const value = { coordId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => row.img)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getIdsByCoordId = async (
    coordId: number,
    userId: number,
  ): Promise<{ roomId: number; paymentId: number } | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT p.payment_id as paymentId, r.room_id as roomId FROM coords c
LEFT JOIN payments p ON p.payment_id = c.payment_id
LEFT JOIN room_user r ON r.room_id = e.room_id
WHERE c.coord_id=:coordId AND r.user_id = :userId;
`
      const value = { userId, coordId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  createCoord = async (paymentId: number, coord: Coord): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coords(payment_id, title, comment) VALUES(:paymentId, :title, :comment)`

      const { title, comment } = coord
      const value = { paymentId, title, comment }

      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  createCloth = async (coordId: number, clothList: Cloth[]): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coord_clothes(coord_id, img, price, purchase_url) VALUES :clothList`
      const value = {
        clothList: clothList.map((item) => {
          const { price, purchaseUrl, img } = item
          return [coordId, img, price, purchaseUrl]
        }),
      }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  createReference = async (
    coordId: number,
    referenceImgList: string[],
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coord_references(coord_id, img) VALUES :clothList`
      const value = {
        clothList: referenceImgList.map((item) => {
          return [coordId, item]
        }),
      }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  requestEditCoord = async (
    paymentId: number,
    coordId: number,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE payments SET request_edit=:coordId WHERE payment_id = :paymentId`
      const value = {
        paymentId,
        coordId,
      }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  confirmCoord = async (paymentId: number, coordId: number): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE payments SET status=3 WHERE payment_id = :paymentId`
      const value = {
        paymentId,
        coordId,
      }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
