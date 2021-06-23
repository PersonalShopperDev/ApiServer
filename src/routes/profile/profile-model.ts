import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'
import { OnBoardingData, OnBoardingDataStylist } from './profile-type'

export default class ProfileModel {
  saveOnBoardData = async (userId: number, data: OnBoardingData) => {
    const connection = await db.getConnection()
    const sql = 'UPDATE users SET data=:data WHERE user_id=:userId'

    const value = { userId, data: JSON.stringify(data) }

    await connection.query(sql, value)
    connection.release()
  }

  saveBasicUserData = async (
    userId: number,
    gender: string,
    userType: string,
  ) => {
    const connection = await db.getConnection()
    const value = { userId, gender }

    const sql = 'UPDATE users SET gender=:gender WHERE user_id=:userId;'
    await connection.query(sql, value)

    if (userType == 'S') {
      const sql2 =
        'INSERT IGNORE INTO stylists(user_id, status) VALUES(:userId, 0);'
      await connection.query(sql2, value)
    }

    connection.release()
  }

  getOnBoardData = async (
    userId: number,
  ): Promise<OnBoardingData | OnBoardingDataStylist | null> => {
    const connection = await db.getConnection()
    const sql = 'SELECT data FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    if (rows[0] == null) return null
    return rows[0]['data']
  }

  getUserData = async (userId: number) => {
    const connection = await db.getConnection()
    const sql = 'SELECT name, introduction FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    if (rows[0] == null) return null
    return rows[0]['data']
  }

  updateUserBasicData = async (
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

  getUserProfileData = async (userId: number): Promise<any> => {
    const connection = await db.getConnection()
    const sql =
      'SELECT name, introduction, profile FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    if (rows[0] == null) return null
    return rows[0]
  }

  updateStylistData = async (userId: number, price: number): Promise<void> => {
    const connection = await db.getConnection()
    const sql = `UPDATE stylists SET price=:price WHERE user_id=:userId`

    const value = { userId, price }

    await connection.query(sql, value)

    connection.release()
  }
}
