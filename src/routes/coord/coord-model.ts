import DB from '../../config/db'
import { Cloth, Coord, Supplier } from './coord-type'
import { RowDataPacket } from 'mysql2'
import DIContainer from '../../config/inversify.config'

export default class CoordModel {
  db = DIContainer.get(DB)

  getCoordBase = async (
    userId: number,
    coordId: number,
  ): Promise<{
    title: string
    comment: string
  } | null> => {
    const sql = `SELECT c.title, c.comment FROM coords c
JOIN payments e ON e.payment_id = c.payment_id
JOIN room_user r ON r.room_id = e.room_id
WHERE coord_id=:coordId AND r.user_id=:userId`

    const value = { userId, coordId }

    const [rows] = await this.db.query(sql, value)

    return rows[0]
  }

  getClothes = async (coordId: number): Promise<Cloth[]> => {
    const sql = `SELECT img, price, purchase_url as purchaseUrl FROM coord_clothes WHERE coord_id=:coordId`

    const value = { coordId }

    const [rows] = await this.db.query(sql, value)

    return rows as Cloth[]
  }

  getReference = async (coordId: number): Promise<string[]> => {
    const sql = `SELECT img FROM coord_references WHERE coord_id=:coordId`

    const value = { coordId }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows.map((row) => row.img)
  }

  getIdsByCoordId = async (
    coordId: number,
    userId: number,
  ): Promise<{ roomId: number; paymentId: number } | null> => {
    const sql = `SELECT p.payment_id as paymentId, r.room_id as roomId FROM coords c
LEFT JOIN payments p ON p.payment_id = c.payment_id
LEFT JOIN room_user r ON r.room_id = p.room_id
WHERE c.coord_id=:coordId AND r.user_id = :userId;
`
    const value = { userId, coordId }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows[0]
  }

  getCoordPayment = async (
    coordId: number,
  ): Promise<{
    status: number
    requestEdit: number | null
  }> => {
    const sql = `SELECT p.status, p.request_edit as requestEdit FROM coords c
 LEFT JOIN payments p on c.payment_id = p.payment_id
 WHERE c.coord_id=:coordId`

    const value = { coordId }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows[0]
  }

  getSupplier = async (coordId: number): Promise<Supplier> => {
    const sql = `SELECT u.user_id as id, u.name, u.img
FROM coords c
LEFT JOIN payments p ON p.payment_id = c.payment_id
LEFT JOIN room_user r ON p.room_id = r.room_id
LEFT JOIN room_user tr ON tr.room_id = r.room_id and tr.user_type='S'
LEFT JOIN users u ON u.user_id = tr.user_id
WHERE c.coord_id=:coordId`

    const value = { coordId }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows[0]
  }

  createCoord = async (paymentId: number, coord: Coord): Promise<number> => {
    const sql = `INSERT INTO coords(payment_id, title, comment) VALUES(:paymentId, :title, :comment)`

    const { title, comment } = coord
    const value = { paymentId, title, comment }

    const [result] = await this.db.query(sql, value)

    return result['insertId']
  }

  createCloth = async (coordId: number, clothList: Cloth[]): Promise<void> => {
    const sql = `INSERT INTO coord_clothes(coord_id, img, price, purchase_url) VALUES :clothList`
    const value = {
      clothList: clothList.map((item) => {
        const { price, purchaseUrl, img } = item
        return [coordId, img, price, purchaseUrl]
      }),
    }

    await this.db.query(sql, value)
  }

  createReference = async (
    coordId: number,
    referenceImgList: string[],
  ): Promise<void> => {
    const sql = `INSERT INTO coord_references(coord_id, img) VALUES :clothList`
    const value = {
      clothList: referenceImgList.map((item) => {
        return [coordId, item]
      }),
    }

    await this.db.query(sql, value)
  }

  requestEditCoord = async (
    paymentId: number,
    coordId: number,
  ): Promise<void> => {
    const sql = `UPDATE payments SET request_edit=:coordId WHERE payment_id = :paymentId`
    const value = {
      paymentId,
      coordId,
    }

    await this.db.query(sql, value)
  }

  confirmCoord = async (paymentId: number, coordId: number): Promise<void> => {
    const connection = await this.db.beginTransaction()

    try {
      const value = {
        paymentId,
        coordId,
      }

      await connection.query(
        `UPDATE payments SET status=3 WHERE payment_id = :paymentId`,
        value,
      )
      await connection.query(
        `UPDATE coords SET status=1 WHERE coord_id = :coordId`,
        value,
      )

      await connection.commit()
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
