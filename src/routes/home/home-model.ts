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

  getStylists = async (): Promise<Array<Stylist> | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT s.user_id, name, profile, introduction,   hireCount, reviewCount FROM stylists s JOIN users  u ON s.user_id = u.user_id 
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS hireCount FROM coordinations GROUP BY stylist_id) h ON h.stylist_id = s.user_id
LEFT JOIN ( SELECT stylist_id, COUNT(*) AS reviewCount FROM coordination_reviews cr JOIN coordinations c ON cr.coordination_id = c.coordination_id GROUP BY stylist_id) r ON r.stylist_id = s.user_id;`

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
      const sql = `SELECT coordination_id as id, title FROM coordination_reviews LIMIT 5;`

      const [rows] = (await connection.query(sql)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          id: row.id,
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
