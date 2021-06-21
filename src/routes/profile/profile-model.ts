import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'
import { ProfileData } from './profile-type'

export default class ProfileModel {
  saveProfileData = async (userId: number, data: ProfileData) => {
    const connection = await db.getConnection()
    const sql = 'UPDATE users SET data=:data WHERE user_id=:userId'

    const value = { userId, data: JSON.stringify(data) }

    await connection.query(sql, value)
    connection.release()
  }

  getProfileData = async (userId: number): Promise<ProfileData> => {
    const connection = await db.getConnection()
    const sql = 'SELECT data FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()
    return rows[0].data
  }
}
