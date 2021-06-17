import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import { Stylist } from './style-type'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'

export default class StyleModel {
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

  getStylists = async (
    type: number[],
    page: number,
    sort: string,
  ): Promise<Array<Stylist> | null> => {
    const pageAmount = 20
    let sortOption
    switch (sort) {
      case 'priceLow':
        sortOption = 'price ASC, hireCount DESC'
        break
      case 'popular':
      default:
        sortOption = 'typeCount DESC, hireCount DESC'
        break
    }

    const connection = await db.getConnection()
    try {
      const sql = `SELECT a.user_id, name, profile, introduction, hireCount, reviewCount, typeCount, price, type FROM
(
    SELECT a.user_id, introduction, price, COUNT(*) as typeCount FROM user_style a
    INNER JOIN (SELECT user_id, introduction, price FROM stylists) c ON a.user_id = c.user_id
    WHERE style_id in (:type)
    GROUP BY a.user_id
) a
LEFT JOIN users u ON a.user_id = u.user_id
LEFT JOIN ( 
\tSELECT user_id, json_arrayagg(VALUE) as type FROM (
\t\tSELECT user_id, st.value FROM user_style us JOIN style_type st ON us.style_id = st.style_id ORDER BY us.style_id ASC
\t) b
\tGROUP BY user_id
) st ON st.user_id = a.user_id
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS hireCount FROM coordinations GROUP BY stylist_id) h ON h.stylist_id = a.user_id
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS reviewCount FROM coordination_reviews cr JOIN coordinations c ON cr.coordination_id = c.coordination_id GROUP BY stylist_id) r ON r.stylist_id = a.user_id
ORDER BY ${sortOption}
LIMIT :pageOffset, :pageAmount;
`

      const value = { type, pageAmount, pageOffset: page * pageAmount }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          id: row.user_id,
          img: row.profile
            ? `${process.env.DOMAIN}v1/resource/user/profile/${row.profile}`
            : null,
          name: row.name,
          price: row.price,
          type: row.type,
          hireCount: row.hireCount ? row.hireCount : 0,
          reviewCount: row.reviewCount ? row.reviewCount : 0,
        }
      })
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }
}
