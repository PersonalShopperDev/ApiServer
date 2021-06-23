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
      const sql = `SELECT a.user_id, name, img, hireCount, reviewCount, typeCount, price, type FROM
(
    SELECT a.user_id, price, COUNT(*) as typeCount FROM user_style a
    INNER JOIN (SELECT user_id, price FROM stylists) c ON a.user_id = c.user_id
    WHERE style_id in (:type)
    GROUP BY a.user_id
) a
LEFT JOIN users u ON a.user_id = u.user_id
LEFT JOIN ( 
    SELECT user_id, json_arrayagg(VALUE) as type FROM (
        SELECT user_id, st.value FROM user_style us JOIN style_type st ON us.style_id = st.style_id ORDER BY us.style_id ASC
    ) b
    GROUP BY user_id
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
          img: row.img
            ? `${process.env.DOMAIN}v1/resource/user/profile/${row.img}`
            : null,
          name: row.name,
          price: row.price,
          rating: 3.0,
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

  getStylistCount = async (type) => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT COUNT(*) as count FROM
(
    SELECT us.user_id, COUNT(*) as typeCount FROM user_style us
    INNER JOIN (SELECT user_id FROM stylists) s ON us.user_id = s.user_id
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
