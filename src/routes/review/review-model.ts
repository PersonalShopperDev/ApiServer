import db from '../../config/db'
import { ReviewContent } from './review-type'
import ChatSocket from '../chat/chat-socket'
import DIContainer from '../../config/inversify.config'
import DB from '../../config/db'

export default class ReviewModel {
  db = DIContainer.get(DB)

  getReviewId = async (estimateId: number): Promise<number | null> => {
    const sql = `SELECT r.coord_id FROM payments e
LEFT JOIN coords c on c.payment_id = e.payment_id
LEFT JOIN coord_reviews r ON r.coord_id = c.coord_id
WHERE e.payment_id=:estimateId
AND c.status=1`

    const [rows] = await this.db.query(sql, { estimateId })

    if (rows[0] == null) return null
    return rows[0].coord_id
  }

  getCoordId = async (
    paymentId: number,
  ): Promise<{
    coordId: number
    userId: number
  } | null> => {
    const sql = `SELECT c.coord_id, r.user_id FROM payments p
LEFT JOIN room_user r ON r.room_id = p.room_id  
LEFT JOIN coords c on c.payment_id = p.payment_id
WHERE p.payment_id=:paymentId
AND c.status=1
AND r.user_type='D'`

    const [result] = await this.db.query(sql, { paymentId })

    if (result[0] == null) return null
    const { coord_id, user_id } = result[0]
    return {
      coordId: coord_id,
      userId: user_id,
    }
  }

  saveReview = async (
    estimateId: number,
    coordId: number,
    data: ReviewContent,
  ): Promise<void> => {
    try {
      await ChatSocket.getInstance().notifyChangePayment(estimateId)
      const sql =
        'INSERT INTO coord_reviews(coord_id, content, rating, public_body) VALUES(:coordId, :content, :rating, :publicBody)'

      const { content, rating, publicBody } = data

      await this.db.query(sql, {
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
    }
  }

  saveReviewImage = async (
    coordId: number,
    keyList: string[],
    type: string,
  ): Promise<void> => {
    const sql =
      'INSERT INTO coord_review_imgs(coord_id, img, type) VALUES :value'

    const value = keyList.map((key) => {
      return [coordId, key, type]
    })

    await this.db.query(sql, { value })
  }

  getCoordInfo = async (
    coordId: number,
  ): Promise<{
    id: number
    name: string
    profile: string
    imgList: string[]
    type: number[]
  }> => {
    const sql = `SELECT r.user_id as id, u.name, u.img as profile, cc.imgList, t.type FROM coords c
LEFT JOIN payments p ON p.payment_id = c.payment_id
LEFT JOIN (
SELECT coord_id, json_arrayagg(img) as imgList FROM coord_clothes GROUP BY coord_id
) cc ON cc.coord_id = c.coord_id
LEFT JOIN room_user r ON r.room_id = p.room_id AND r.user_type = 'S'
LEFT JOIN users u ON r.user_id = u.user_id
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON r.user_id = t.user_id
WHERE c.coord_id=:coordId
;`

    const [rows] = await this.db.query(sql, { coordId })
    return rows[0]
  }
}
