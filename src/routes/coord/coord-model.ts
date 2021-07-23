import db from '../../config/db'
import { ClothData } from './coord-type'
import { RowDataPacket } from 'mysql2'

export default class CoordModel {
  getCoordBase = async (
    userId: number,
    coordId: number,
  ): Promise<{
    mainImg: string
    title: string
    comment: string
  } | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT c.img as mainImg, c.title, c.comment FROM coords c
JOIN room_user r ON r.room_id = c.room_id AND r.user_id=:userId
WHERE coord_id=:coordId`

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

  findEstimate = async (
    demanderId: number,
    supplierId: number,
  ): Promise<number | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT max(estimate_id) AS id FROM estimates e
RIGHT JOIN (
  SELECT room_id, COUNT(*) as cnt FROM room_user
  WHERE (user_id=166 AND user_type='D') OR (user_id=54 AND user_type='S')
  GROUP BY room_id
  HAVING cnt >= 2
) r ON r.room_id = e.room_id
`

      const value = { demanderId, supplierId }

      const [rows] = await connection.query(sql, value)

      if (rows[0] == null) return null

      return rows[0].id
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
LEFT JOIN estimates e ON e.estimate_id = c.estimate_id
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
      const sql = `INSERT INTO coords(estimate_id, title, comment) VALUES(:estimateId, :title, :comment)`

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
      const sql = `INSERT INTO coord_clothes(coord_id, img, name, price, purchase_url) VALUES :value`

      await connection.query(sql, {
        value: [coordId, item.img, item.name, item.price, item.purchaseUrl],
      })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
