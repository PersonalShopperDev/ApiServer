import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import { Banner, Review, Stylist } from './home-type'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'

export default class HomeModel {
  getBanners = async (): Promise<Array<Banner> | null> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT img_path as img FROM banners WHERE (start_date IS NULL OR DATE(start_date) < NOW()) AND (end_date IS NULL OR DATE(end_date) > NOW());'

      const [rows] = (await connection.query(sql)) as RowDataPacket[]

      return rows.map((e) => {
        return {
          img: `${process.env.DOMAIN}v1/resource/banner/${e.img}`,
        }
      })
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }

  getStylistsWithStyle = async (
    userId: number,
  ): Promise<Array<Stylist> | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT a.user_id, name, profile, introduction, hireCount, reviewCount, typeCount FROM 
(
    SELECT a.user_id, introduction, COUNT(*) as typeCount FROM user_style a
    RIGHT JOIN (SELECT style_id FROM user_style WHERE user_id = :userId) b ON a.style_id = b.style_id
    INNER JOIN (SELECT user_id, introduction FROM stylists) c ON a.user_id = c.user_id
    GROUP BY a.user_id
    HAVING COUNT(*) >= 2
) a
LEFT JOIN users u ON a.user_id = u.user_id 
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS hireCount FROM coordinations GROUP BY stylist_id) h ON h.stylist_id = a.user_id
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS reviewCount FROM coordination_reviews cr JOIN coordinations c ON cr.coordination_id = c.coordination_id GROUP BY stylist_id) r ON r.stylist_id = a.user_id
ORDER BY typeCount DESC, hireCount DESC
LIMIT 6;`

      const value = { userId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          id: row.user_id,
          img: row.profile
            ? `${process.env.DOMAIN}v1/resource/user/profile/${row.profile}`
            : null,
          name: row.name,
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

  getStylists = async (): Promise<Array<Stylist> | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT a.user_id, name, profile, introduction, price, hireCount, reviewCount FROM stylists a
LEFT JOIN users u ON a.user_id = u.user_id 
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS hireCount FROM coordinations GROUP BY stylist_id) h ON h.stylist_id = a.user_id
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS reviewCount FROM coordination_reviews cr JOIN coordinations c ON cr.coordination_id = c.coordination_id GROUP BY stylist_id) r ON r.stylist_id = a.user_id
ORDER BY hireCount DESC, reviewCount DESC, price ASC
LIMIT 6;`

      const [rows] = (await connection.query(sql)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          id: row.user_id,
          img: row.profile
            ? `${process.env.DOMAIN}v1/resource/user/profile/${row.profile}`
            : null,
          name: row.name,
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

  getReviews = async (): Promise<Array<Review> | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT r.coordination_id as id, c.stylist_id as stylistId, title FROM coordination_reviews r JOIN coordinations c on c.coordination_id = r.coordination_id LIMIT 5;`

      const [rows] = (await connection.query(sql)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          id: row.id,
          stylistId: row.stylistId,
          title: row.title,
          beforeImg: '',
          afterImg: '',
        }
      })
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }
}
