import db from '../../config/db'
import { Supplier } from './supplier-type'
import { RowDataPacket } from 'mysql2'
import StyleModel from '../style/style-model'

export default class SupplierModel {
  getStyleTypeId = async (userId: number): Promise<number[] | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT style_id as id FROM user_style WHERE user_id = :userId;`
      const value = { userId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => row.id)
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }

  convertStyleTypeIdFromString = async (
    type: string,
  ): Promise<number[] | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT style_id FROM style_type WHERE VALUE IN (type);`
      const value = { type }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => row.id)
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }

  getSupplierList = async (
    type: number[],
    page: number,
    sort: string,
  ): Promise<Array<Supplier> | null> => {
    const pageAmount = 20
    let sortOption
    switch (sort) {
      case 'priceLow':
        sortOption = 'price ASC, typeCount DESC, popular DESC'
        break
      case 'popular':
      default:
        sortOption = 'typeCount DESC, popular DESC'
        break
    }

    const connection = await db.getConnection()
    const sql = `SELECT s.user_id, name, img, hireCount, reviewCount, typeCount, price, popular, type, rating FROM suppliers s
LEFT JOIN users u ON s.user_id = u.user_id
LEFT JOIN (
    SELECT supplier_id, COUNT(*) AS hireCount, COUNT(rating) AS reviewCount, AVG(rating) AS rating FROM coordinations c
    LEFT JOIN coordination_reviews cr ON cr.coordination_id = c.coordination_id
) cnt ON s.user_id=cnt.supplier_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as typeCount FROM user_style
    WHERE style_id IN (:type)
    GROUP BY user_id
) tf ON s.user_id = tf.user_id
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON s.user_id = t.user_id
ORDER BY ${sortOption}
LIMIT :pageOffset, :pageAmount;
`

    const value = { type, pageAmount, pageOffset: page * pageAmount }
    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    return rows.map((row) => {
      return {
        id: row.user_id,
        img: row.img ? `${process.env.DOMAIN}v1/resource/${row.img}` : null,
        name: row.name,
        price: row.price,
        styleType:
          row.type == null
            ? []
            : row.type.map((id) => {
                return { id, value: StyleModel.convertStyleIdToValue(id) }
              }),
        hireCount: row.hireCount,
        reviewCount: row.reviewCount,
        rating: row.rating,
      }
    })
  }

  getSupplierCount = async (type) => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT COUNT(*) as count FROM
(
    SELECT us.user_id, COUNT(*) as typeCount FROM user_style us
    INNER JOIN (SELECT user_id FROM suppliers) s ON us.user_id = s.user_id
    WHERE style_id IN (:type)
    GROUP BY us.user_id
) a; `

      const value = { type }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows[0].count
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }
}
