import db from '../../config/db'
import { RowDataPacket } from 'mysql2'
import { Img, Review, ReviewModelData } from './profile-type'
import ResourcePath from '../resource/resource-path'

export default class ProfileModel {
  saveProfile = async (
    userId: number,
    name: string | undefined,
    introduction: string | undefined,
    profile: string | undefined,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      if (name == null && introduction == null && profile == null) return

      const data = { name, introduction, profile }
      let fields = ''
      for (const key in data) {
        if (data[key] != null) fields += `${key}=:${key},`
      }

      fields = fields.substring(0, fields.length - 1)

      const sql = `UPDATE users SET ${fields} WHERE user_id=:userId`

      const value = { userId, name, introduction, profile }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getBasicProfile = async (
    userId: number,
  ): Promise<{
    name: string | undefined
    introduction: string | undefined
    img: string | undefined
    profile: any
    onboard: any
  }> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT name, introduction, profile, img, onboard FROM users WHERE user_id=:userId'

      const value = { userId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      const { name, introduction, profile, img, onboard } = rows[0]
      return {
        name,
        introduction,
        profile,
        img,
        onboard,
      }
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getSupplierPoint = async (
    userId: number,
  ): Promise<{
    hireCount: number
    reviewCount: number
    rating: number | undefined
  }> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT r.user_id, COUNT(*) AS hireCount, COUNT(rating) AS reviewCount, ROUND(AVG(rating),2) AS rating FROM coords c
LEFT JOIN estimates e ON e.estimate_id = c.estimate_id
LEFT JOIN room_user r ON r.room_id = e.room_id AND r.user_type='S'
LEFT JOIN coord_reviews cr ON cr.coord_id = c.coord_id
GROUP BY r.user_id;`

      const value = { userId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      if (rows[0] == null) {
        return {
          hireCount: 0,
          reviewCount: 0,
          rating: undefined,
        }
      }

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getClosetList = async (userId: number): Promise<Img[]> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT closet_id as id, img_path as img FROM closets WHERE user_id = :userId;'

      const value = { userId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        const { id, img } = row
        return {
          id,
          img: ResourcePath.closetImg(img),
        }
      })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getPrice = async (userId: number): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = 'SELECT price FROM suppliers WHERE user_id = :userId;'

      const value = { userId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows[0].price
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
  // getReviewList = async (userId: number): Promise<Img[]> => {
  //   const connection = await db.getConnection()
  //   const sql =
  //     'SELECT closet_id as id, img_path as img FROM closets WHERE user_id = :userId;'
  //
  //   const value = { userId }
  //
  //   const [rows] = (await connection.query(sql, value)) as RowDataPacket[]
  //
  //   connection.release()
  //
  //   return rows as Img[]
  // }

  getCoordList = async (userId: number): Promise<Img[]> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT lookbook_id AS id, img_path AS img FROM lookbooks WHERE user_id = :userId AND represent = 1;'

      const value = { userId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        const { id, img } = row
        return {
          id,
          img: ResourcePath.lookbookImg(img),
        }
      })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getLookbookList = async (userId: number, page: number): Promise<Img[]> => {
    const pageAmount = 20

    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT lookbook_id AS id, img_path AS img FROM lookbooks WHERE user_id = :userId AND represent = 0 LIMIT :pageOffset, :pageAmount;'

      const value = { userId, pageAmount, pageOffset: page * pageAmount }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        const { id, img } = row
        return {
          id,
          img: ResourcePath.lookbookImg(img),
        }
      })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getReviewListDemander = async (demanderId: number): Promise<Review[]> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT r.coord_id AS id, c.img, 1 as status  FROM coord_reviews r
LEFT JOIN coords c ON c.coord_id = r.coord_id
LEFT JOIN estimates e ON e.estimate_id = c.estimate_id
LEFT JOIN room_user rd ON rd.room_id = e.room_id AND rd.user_type='D'
WHERE rd.user_id=:demanderId
LIMIT 3`

      const value = { demanderId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows as Review[]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getReviewListSupplier = async (
    supplierId: number,
    page: number,
  ): Promise<ReviewModelData[]> => {
    const pageAmount = 20

    const connection = await db.getConnection()
    try {
      const sql = `SELECT r.coord_id AS id, u.name, u.img AS profileImg, c.img as coordImg, r.content, r.rating, r.public_body AS publicBody, t.type, u.profile, u.onboard, r.create_time AS date  FROM coord_reviews r
LEFT JOIN coords c ON c.coord_id = r.coord_id
LEFT JOIN estimates e ON e.estimate_id = c.estimate_id
LEFT JOIN room_user rd ON rd.room_id = e.room_id AND rd.user_type='D'
LEFT JOIN room_user rs ON rs.room_id = e.room_id AND rs.user_type='S'
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON rd.user_id = t.user_id
LEFT JOIN users u ON rd.user_id = u.user_id
WHERE rs.user_id=:supplierId
LIMIT :pageOffset, :pageAmount;`

      const value = { supplierId, pageAmount, pageOffset: page * pageAmount }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows as ReviewModelData[]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getReviewImg = async (
    id: number,
  ): Promise<Array<{ img: string; type: string }>> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT img, type FROM coord_review_imgs WHERE coord_id = :id`

      const value = { id }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows as Array<{ img: string; type: string }>
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  updateSupplierData = async (userId: number, price: number): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE suppliers SET price=:price WHERE user_id=:userId`

      const value = { userId, price }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  postProfileImg = async (userId: number, path: string): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE users SET img=:path WHERE user_id=:userId`

      const value = { userId, path }

      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  postLookbook = async (
    userId: number,
    path: string,
    represent: boolean,
  ): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO lookbooks(img_path, user_id, represent) VALUES(:path, :userId, :represent)`

      const value = { userId, path, represent: represent ? 1 : 0 }

      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  postCloset = async (userId: number, path: string): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO closets(img_path, user_id) VALUES(:path, :userId)`

      const value = { userId, path }

      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
