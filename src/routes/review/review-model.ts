import db from '../../config/db'
import { ReviewContent } from './review-type'

export default class ReviewModel {
  getCoordinationUserId = async (coordId: number): Promise<number | null> => {
    const connection = await db.getConnection()
    try {
      const sql = 'SELECT demander_id as id FROM coords WHERE coord_id=:coordId'

      const [result] = await connection.query(sql, { coordId })

      if (result[0] == null) return null
      return result[0]['id']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveReview = async (coordId: number, data: ReviewContent): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO coordination_reviews(coord_id, content, rating, public_body) VALUES(:coordId, :content, :rating, :publicBody)'

      const { content, rating, publicBody } = data

      await connection.query(sql, {
        coordId,
        content,
        rating,
        publicBody: publicBody ? 1 : 0,
      })
    } catch (e) {
      if (e.code == 'ER_DUP_ENTRY' || e.code == 1062) {
        throw Error('DUP_REVIEW')
      } else {
        throw e
      }
    } finally {
      connection.release()
    }
  }

  saveReviewImage = async (
    coordId: number,
    keyList: string[],
    type: string,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO coordination_review_imgs(coord_id, img, type) VALUES :value'

      const value = keyList.map((key) => {
        return [coordId, key, type]
      })

      await connection.query(sql, { value })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getCoordInfo = async (
    coordId: number,
  ): Promise<{
    id: number
    name: string
    profile: string
    img: string
    type: number[]
  }> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT supplier_id as id, u.name, u.img as profile, c.img, type FROM coords c
LEFT JOIN users u ON c.supplier_id = u.user_id
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON c.supplier_id = t.user_id
WHERE coord_id=:coordId
;`

      const [rows] = await connection.query(sql, { coordId })
      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
