import db from '../../config/db'
import { Supplier } from './user-type'
import { RowDataPacket } from 'mysql2'
import StyleModel from '../style/style-model'
import ResourcePath from '../resource/resource-path'
import Data from '../../data/data'
import DIContainer from '../../config/inversify.config'
import DB from '../../config/db'

export default class UserModel {
  db = DIContainer.get(DB)

  getStyleTypeId = async (userId: number): Promise<number[] | null> => {
    try {
      const sql = `SELECT style_id as id FROM user_style WHERE user_id = :userId;`
      const value = { userId }
      const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => row.id)
    } catch (e) {
      return null
    }
  }

  getSupplierList = async (
    styleType: number[],
    gender: string | undefined,
    page: number,
    sort: string,
    supplierType: number | number[] | undefined,
    filter = false,
  ): Promise<Array<Supplier>> => {
    const pageAmount = 20
    let sortOption
    switch (sort) {
      case 'hireCount':
        sortOption = 'price ASC, hireCount DESC, popular DESC'
        break
      case 'priceLow':
        sortOption = 'price ASC, typeCount DESC, popular DESC'
        break
      case 'recommend':
      default:
        sortOption = 'typeCount DESC, popular DESC'
        break
    }

    const sql = `SELECT s.user_id, name, img, hireCount, reviewCount, price, type, rating FROM suppliers s
LEFT JOIN users u ON s.user_id = u.user_id
LEFT JOIN (
    SELECT r.user_id, COUNT(*) AS hireCount, COUNT(rating) AS reviewCount, ROUND(AVG(rating),2) AS rating FROM coords c
    LEFT JOIN payments e ON e.payment_id = c.payment_id
    LEFT JOIN room_user r ON r.room_id = e.room_id AND r.user_type='S'
    LEFT JOIN coord_reviews cr ON cr.coord_id = c.coord_id
    GROUP BY r.user_id
) cnt ON s.user_id=cnt.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as typeCount FROM user_style
    ${styleType.length > 0 ? 'WHERE style_id IN (:styleType)' : ''}
    GROUP BY user_id
) tf ON s.user_id = tf.user_id
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON s.user_id = t.user_id
WHERE 1=1
AND u.name IS NOT NULL
AND ${supplierType != null ? 's.status in (:supplierType)' : 's.status >= 0'}
${filter ? ` AND typeCount >= 0 ` : ''}
ORDER BY ISNULL(img) ASC, ${sortOption}
LIMIT :pageOffset, :pageAmount;
`
    // AND supplyGender & :gender = :gender

    const value = {
      styleType,
      pageAmount,
      supplierType,
      pageOffset: page * pageAmount,
      gender: gender == 'M' ? 1 : gender == 'F' ? 2 : 3,
    }
    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows.map((row) => {
      return {
        id: row.user_id,
        img: ResourcePath.profileImg(row.img),
        name: row.name,
        price: row.price,
        styleType: row.type == null ? [] : Data.getStyleItemList(row.type),
        hireCount: row.hireCount,
        reviewCount: row.reviewCount,
        rating: row.rating,
      }
    })
  }

  getSupplierCount = async (type) => {
    try {
      const sql = `SELECT COUNT(*) as count FROM
(
    SELECT us.user_id, COUNT(*) as typeCount FROM user_style us
    INNER JOIN (SELECT user_id FROM suppliers) s ON us.user_id = s.user_id
    WHERE style_id IN (:type)
    GROUP BY us.user_id
) a; `

      const value = { type }
      const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

      return rows[0].count
    } catch (e) {
      return null
    }
  }

  getDemanderList = async (
    styleType: number[],
    gender: string | undefined,
    page: number,
  ): Promise<Array<Supplier>> => {
    const pageAmount = 20

    const sql = `SELECT u.user_id, u.img, u.name, t.type FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) as typeCount FROM user_style
    ${styleType.length > 0 ? 'WHERE style_id IN (:styleType)' : ''}
    GROUP BY user_id
) tf ON u.user_id = tf.user_id
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON u.user_id = t.user_id
WHERE NOT EXISTS (SELECT user_id FROM suppliers WHERE user_id = u.user_id)
${gender != null ? 'AND u.gender = :gender' : ''}
ORDER BY typeCount DESC, u.user_id DESC 
LIMIT :pageOffset, :pageAmount;
`

    const value = {
      styleType,
      pageAmount,
      pageOffset: page * pageAmount,
      gender,
    }
    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    return rows.map((row) => {
      return {
        id: row.user_id,
        img: ResourcePath.profileImg(row.img),
        name: row.name,
        styleType: row.type == null ? [] : Data.getStyleItemList(row.type),
      }
    })
  }
}
