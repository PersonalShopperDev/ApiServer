import db from '../../config/db'
import { ClothData } from './coord-type'

export default class CoordModel {
  getCoordBase = async (
    userId: number,
    coordId: number,
  ): Promise<{
    img: string
    comment: string
  } | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT img, comment FROM coords c
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

  findRoom = async (
    demanderId: number,
    supplierId: number,
  ): Promise<number | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT room_id, COUNT(*) as cnt FROM room_user
 WHERE (user_id=:demanderId AND user_type='D') OR (user_id=:supplierId AND user_type='S')
 GROUP BY room_id
 HAVING cnt >= 2;`

      const value = { demanderId, supplierId }

      const [rows] = await connection.query(sql, value)

      if (rows[0] == null) return null

      return rows[0].room_id
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  newCoord = async (roomId: number, comment: string): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coords(room_id, comment) VALUES(:roomId, :comment)`

      const value = { roomId, comment }

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

  insertCloth = async (coordId: number, data: ClothData[]): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO coord_clothes(coord_id, img, name, price, purchase_url) VALUES :value`

      const value = data.map((item) => {
        return [coordId, item.img, item.name, item.price, item.purchaseUrl]
      })

      await connection.query(sql, { value })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
