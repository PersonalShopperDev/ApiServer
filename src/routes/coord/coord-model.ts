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
      const sql = `SELECT img, name, price, purchase_url as purchaseUrl FROM coord_references WHERE coord_id=:coordId`

      const value = { coordId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows as string[]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  findEstimate = async (
    demanderId: number,
    supplierId: number,
  ): Promise<CoordIdData | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT e.payment_id AS estimateId, e.status, e.room_id as roomId FROM payments e
RIGHT JOIN (
  SELECT room_id, COUNT(*) as cnt FROM room_user
  WHERE (user_id=:demanderId AND user_type='D') OR (user_id=:supplierId AND user_type='S')
  GROUP BY room_id
  HAVING cnt >= 2
) r ON r.room_id = e.room_id
WHERE status = 4
`

      const value = { demanderId, supplierId }

      const [rows] = await connection.query(sql, value)

      if (rows[0] == null) return null

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  checkCoordId = async (
    coordId: number,
    userId: number,
  ): Promise<number | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT c.coord_id, cc.name FROM coords c
LEFT JOIN payments e ON e.payment_id = c.payment_id
LEFT JOIN room_user r ON r.room_id = e.room_id
LEFT JOIN coord_clothes cc ON cc.coord_id = c.coord_id
WHERE c.coord_id=:coordId AND r.user_id = :userId;
`
      const value = { userId, coordId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      if (rows[0] == null) return null

      return rows[0].name == null ? 0 : rows.length
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  newCoord = async (
    estimateId: number,
    title: string,
    comment: string,
  ): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coords(payment_id, title, comment) VALUES(:estimateId, :title, :comment)`

      const value = { estimateId, title, comment }

      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  updateCoordImg = async (coordId: number, img: string): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE coords SET img=:img WHERE coord_id=:coordId`

      const value = { coordId, img }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  insertCloth = async (coordId: number, item: ClothData): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coord_clothes(coord_id, img, name, price, purchase_url) 
VALUES (:coordId, :img, :name, :price, :purchaseUrl)`
      const value = { coordId, ...item }

      await connection.query(sql, value)
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
      const sql = `INSERT INTO coord_clothes(coord_id, img, price, purchase_url) VALUES (:clothList)`
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
    referenceList: string[],
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coord_reference(coord_id, img) VALUES :clothList`
      const value = {
        clothList: referenceList.map((item) => {
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
}
