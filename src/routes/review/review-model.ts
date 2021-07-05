import db from '../../config/db'
import { ReviewContent } from './review-type'

export default class ReviewModel {
  getCoordinationUserId = async (coordId: number): Promise<number | null> => {
    const connection = await db.getConnection()
    const sql =
      'SELECT demander_id as id FROM coordinations WHERE coordination_id=:coordId'

    const [result] = await connection.query(sql, { coordId })
    connection.release()

    if (result[0] == null) return null
    return result[0]['id']

    return null
    // throw Error()
  }

  saveReview = async (coordId: number, data: ReviewContent): Promise<void> => {
    const connection = await db.getConnection()
    const sql =
      'INSERT INTO coordination_reviews(coordination_id, content, rating, public_body) VALUES(:coordId, :content, :rating, :publicBody)'

    const { content, rating, publicBody } = data

    try {
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
        throw Error()
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
    const sql =
      'INSERT INTO coordination_review_imgs(coordination_id, img, type) VALUES :value'

    const value = keyList.map((key) => {
      return [coordId, key, type]
    })

    await connection.query(sql, { value })
    connection.release()
  }
}
