import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import { Banner, Review, Supplier } from './home-type'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'

export default class HomeModel {
  getBanners = async (): Promise<Array<Banner> | null> => {
    const connection = await db.getConnection()

    const sql =
      'SELECT img_path as img FROM banners WHERE (start_date IS NULL OR DATE(start_date) < NOW()) AND (end_date IS NULL OR DATE(end_date) > NOW());'

    const [rows] = (await connection.query(sql)) as RowDataPacket[]
    connection.release()

    return rows.map((e) => {
      return {
        img: `${process.env.DOMAIN}v1/resource/banner/${e.img}`,
      }
    })
  }

  getSupplierWithStyle = async (
    userId: number,
  ): Promise<Array<Supplier> | null> => {
    const connection = await db.getConnection()

    const sql = `SELECT a.user_id, name, img, hireCount, reviewCount, typeCount FROM 
(
    SELECT a.user_id, COUNT(*) as typeCount FROM user_style a
    RIGHT JOIN (SELECT style_id FROM user_style WHERE user_id = :userId) b ON a.style_id = b.style_id
    INNER JOIN (SELECT user_id FROM suppliers) c ON a.user_id = c.user_id
    GROUP BY a.user_id
    HAVING COUNT(*) >= 2
) a
LEFT JOIN users u ON a.user_id = u.user_id 
LEFT JOIN ( SELECT supplier_id, COUNT(*) AS hireCount FROM coordinations GROUP BY supplier_id) h ON h.supplier_id = a.user_id
LEFT JOIN ( SELECT supplier_id, COUNT(*) AS reviewCount FROM coordination_reviews cr JOIN coordinations c ON cr.coordination_id = c.coordination_id GROUP BY supplier_id) r ON r.supplier_id = a.user_id
ORDER BY typeCount DESC, hireCount DESC
LIMIT 6;`

    const value = { userId }
    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]
    connection.release()

    return rows.map((row) => {
      return {
        id: row.user_id,
        img: row.img ? `${process.env.DOMAIN}v1/resource/${row.img}` : null,
        name: row.name,
        hireCount: row.hireCount ? row.hireCount : 0,
        reviewCount: row.reviewCount ? row.reviewCount : 0,
      }
    })
  }

  getSupplier = async (): Promise<Array<Supplier> | null> => {
    const connection = await db.getConnection()

    const sql = `SELECT a.user_id, name, img, price, hireCount, reviewCount FROM suppliers a
LEFT JOIN users u ON a.user_id = u.user_id 
LEFT JOIN ( SELECT supplier_id, COUNT(*) AS hireCount FROM coordinations GROUP BY supplier_id) h ON h.supplier_id = a.user_id
LEFT JOIN ( SELECT supplier_id, COUNT(*) AS reviewCount FROM coordination_reviews cr JOIN coordinations c ON cr.coordination_id = c.coordination_id GROUP BY supplier_id) r ON r.supplier_id = a.user_id
ORDER BY hireCount DESC, reviewCount DESC, price ASC
LIMIT 6;`

    const [rows] = (await connection.query(sql)) as RowDataPacket[]
    connection.release()

    return rows.map((row) => {
      return {
        id: row.user_id,
        img: row.img ? `${process.env.DOMAIN}v1/resource/${row.img}` : null,
        name: row.name,
        hireCount: row.hireCount ? row.hireCount : 0,
        reviewCount: row.reviewCount ? row.reviewCount : 0,
      }
    })
  }

  getReviews = async (): Promise<Array<Review> | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT r.coordination_id as id, c.supplier_id as supplierId, title FROM coordination_reviews r JOIN coordinations c on c.coordination_id = r.coordination_id LIMIT 5;`

      const [rows] = (await connection.query(sql)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          id: row.id,
          supplierId: row.supplierId,
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
