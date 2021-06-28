import db from '../../config/db'
import { RowDataPacket } from 'mysql2'
import { Img, ProfileDemanderPatch, ProfileSupplierPatch } from './profile-type'

export default class ProfileModel {
  saveProfile = async (
    userId: number,
    name: string | undefined,
    introduction: string | undefined,
    profile: string | undefined,
  ): Promise<void> => {
    const connection = await db.getConnection()

    if (name == null && introduction == null && profile == null) return

    const data = { name, introduction, profile }
    let fields = ''
    for (const key in data) {
      if (data[key] != null) fields += `${key}=:${key},`
    }

    fields = fields.substring(0, fields.length - 1)

    const sql = `UPDATE users SET ${fields} WHERE user_id=:userId`

    const value = { userId, name, introduction, profile }

    await connection.query(sql, value)

    connection.release()
  }

  getBasicProfile = async (
    userId: number,
  ): Promise<{
    name: string | undefined
    introduction: string | undefined
    img: string | undefined
    profile: any
    onboard: any
  }> => {
    const connection = await db.getConnection()
    const sql =
      'SELECT name, introduction, profile, img, onboard FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    const { name, introduction, profile, img, onboard } = rows[0]
    return {
      name,
      introduction,
      profile,
      img: `${process.env.DOMAIN}v1/resource/${img}`,
      onboard,
    }
  }

  getClosetList = async (userId: number): Promise<Img[]> => {
    const connection = await db.getConnection()
    const sql =
      'SELECT closet_id as id, img_path as img FROM closets WHERE user_id = :userId;'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    return rows.map(this.convertImg)
  }

  getPrice = async (userId: number): Promise<number> => {
    const connection = await db.getConnection()
    const sql = 'SELECT price FROM stylists WHERE user_id = :userId;'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    return rows[0].price
  }
  // getReviewList = async (userId: number): Promise<Img[]> => {
  //   const connection = await db.getConnection()
  //   const sql =
  //     'SELECT closet_id as id, img_path as img FROM closets WHERE user_id = :userId;'
  //
  //   const value = { userId }
  //
  //   const [rows] = (await connection.query(sql, value)) as RowDataPacket[]
  //
  //   connection.release()
  //
  //   return rows as Img[]
  // }

  getCoordList = async (userId: number): Promise<Img[]> => {
    const connection = await db.getConnection()
    const sql =
      'SELECT lookbook_id AS id, img_path AS img FROM lookbooks WHERE user_id = :userId AND represent = 1;'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    return rows.map(this.convertImg)
  }

  getLookbookList = async (userId: number, page: number): Promise<Img[]> => {
    const pageAmount = 20

    const connection = await db.getConnection()
    const sql =
      'SELECT lookbook_id AS id, img_path AS img FROM lookbooks WHERE user_id = :userId AND represent = 0 LIMIT :pageOffset, :pageAmount;'

    const value = { userId, pageAmount, pageOffset: page * pageAmount }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    return rows.map(this.convertImg)
  }

  updateStylistData = async (userId: number, price: number): Promise<void> => {
    const connection = await db.getConnection()
    const sql = `UPDATE stylists SET price=:price WHERE user_id=:userId`

    const value = { userId, price }

    await connection.query(sql, value)

    connection.release()
  }

  postProfileImg = async (userId: number, path: string): Promise<number> => {
    const connection = await db.getConnection()
    const sql = `UPDATE users INTO img=:path WHERE user_id=:userId`

    const value = { userId, path }

    const [result] = await connection.query(sql, value)

    connection.release()
    return result['insertId']
  }

  postLookbook = async (
    userId: number,
    path: string,
    represent: boolean,
  ): Promise<number> => {
    const connection = await db.getConnection()
    const sql = `INSERT INTO lookbooks(img_path, user_id, represent) VALUES(:path, :userId, :represent)`

    const value = { userId, path, represent: represent ? 1 : 0 }

    const [result] = await connection.query(sql, value)

    connection.release()
    return result['insertId']
  }

  postCloset = async (userId: number, path: string): Promise<number> => {
    const connection = await db.getConnection()
    const sql = `INSERT INTO closet(img_path, user_id) VALUES(:path, :userId)`

    const value = { userId, path }

    const [result] = await connection.query(sql, value)

    connection.release()
    return result['insertId']
  }

  private convertImg = (row) => {
    const { id, img } = row

    return {
      id,
      img: `${process.env.DOMAIN}v1/resource/${img}`,
    }
  }
}
