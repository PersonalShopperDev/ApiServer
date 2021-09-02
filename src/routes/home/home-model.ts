import DB from '../../config/db'
import { Demander, Supplier } from './home-type'
import { RowDataPacket } from 'mysql2'
import ResourcePath from '../resource/resource-path'
import DIContainer from '../../config/inversify.config'

export default class HomeModel {
  db = DIContainer.get(DB)

  getBanners = async (): Promise<
    {
      img: string
      actionType: string
      actionArgId: number
    }[]
  > => {
    const sql =
      'SELECT img_path as img, action_type as actionType, action_arg_id as actionArgId  FROM banners WHERE (start_date IS NULL OR DATE(start_date) < NOW()) AND (end_date IS NULL OR DATE(end_date) > NOW());'

    const [rows] = await this.db.query(sql)

    return rows as any
  }

  getSupplierWithLogin = async (
    userId: number,
    gender: string | null,
  ): Promise<Array<Supplier> | null> => {
    const sql = `
SELECT s.user_id, name, img, hireCount, reviewCount, tf.typeCount FROM suppliers s
LEFT JOIN users u ON s.user_id = u.user_id
LEFT JOIN (
  SELECT r.user_id, COUNT(*) AS hireCount, COUNT(rating) AS reviewCount  FROM coords c
  LEFT JOIN payments e ON e.payment_id = c.payment_id
  LEFT JOIN room_user r ON r.room_id = e.room_id AND r.user_type='S'
  LEFT JOIN coord_reviews cr ON cr.coord_id = c.coord_id
  GROUP BY r.user_id
) cnt ON s.user_id=cnt.user_id
LEFT JOIN (
    SELECT a.user_id, COUNT(*) as typeCount FROM user_style a
    RIGHT JOIN (SELECT style_id FROM user_style WHERE user_id = :userId) b ON a.style_id = b.style_id
    INNER JOIN (SELECT user_id FROM suppliers) c ON a.user_id = c.user_id
    GROUP BY a.user_id
) tf ON s.user_id = tf.user_id
WHERE supplyGender & :gender = :gender 
AND s.status >= 0
ORDER BY ISNULL(img) ASC, typeCount DESC, s.popular DESC
LIMIT 6;`

    const value = {
      userId,
      gender: gender == 'M' ? 1 : gender == 'F' ? 2 : 3,
    }
    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows.map((row) => {
      return {
        id: row.user_id,
        img: ResourcePath.profileImg(row.img),
        name: row.name,
        hireCount: row.hireCount ? row.hireCount : 0,
        reviewCount: row.reviewCount ? row.reviewCount : 0,
      }
    })
  }

  getSupplier = async (): Promise<Array<Supplier> | null> => {
    const sql = `SELECT a.user_id, name, img, price, hireCount, reviewCount FROM suppliers a
LEFT JOIN users u ON a.user_id = u.user_id 
LEFT JOIN (
  SELECT r.user_id, COUNT(*) AS hireCount, COUNT(rating) AS reviewCount  FROM coords c
  LEFT JOIN payments e ON e.payment_id = c.payment_id
  LEFT JOIN room_user r ON r.room_id = e.room_id AND r.user_type='S'
  LEFT JOIN coord_reviews cr ON cr.coord_id = c.coord_id
  GROUP BY r.user_id
) cnt ON a.user_id=cnt.user_id 
WHERE a.status >= 0
ORDER BY isHome DESC, ISNULL(img) ASC, a.popular DESC
LIMIT 6;`

    const [rows] = (await this.db.query(sql)) as RowDataPacket[]

    return rows.map((row) => {
      return {
        id: row.user_id,
        img: ResourcePath.profileImg(row.img),
        name: row.name,
        hireCount: row.hireCount ? row.hireCount : 0,
        reviewCount: row.reviewCount ? row.reviewCount : 0,
      }
    })
  }

  getDemanderWithLogin = async (userId: number): Promise<Array<Demander>> => {
    const sql = `
SELECT u.user_id AS id, u.img, u.name, t.type AS styles FROM users u
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON u.user_id = t.user_id
WHERE NOT EXISTS (SELECT user_id FROM suppliers WHERE user_id = u.user_id)
ORDER BY u.user_id DESC 
LIMIT 6;`

    const value = { userId }
    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows as any
  }

  getReviews = async (): Promise<
    {
      coord_id: number
      demanderId: number
      supplierId: number
      content: string
      img: string
      style: number[]
      onboard: any
    }[]
  > => {
    const sql = `SELECT r.coord_id, rd.user_id AS demanderId, rs.user_id AS supplierId, r.content, i.img, t.style, u.onboard FROM coord_reviews r
LEFT JOIN coord_review_imgs i ON i.coord_id = r.coord_id AND i.type = 'H'
LEFT JOIN coords c ON c.coord_id = r.coord_id
LEFT JOIN payments e ON e.payment_id = c.payment_id
LEFT JOIN room_user rd ON rd.room_id = e.room_id AND rd.user_type='D'
LEFT JOIN room_user rs ON rs.room_id = e.room_id AND rs.user_type='S'
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS style FROM user_style
    GROUP BY user_id
) t ON rd.user_id = t.user_id
LEFT JOIN users u ON u.user_id = rd.user_id
WHERE r.is_home = 1
;`

    const [rows] = (await this.db.query(sql)) as RowDataPacket[]
    return rows as any
  }
}
