import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'
import { OnboardDemander, OnboardSupplier } from './onboard-type'

export default class OnboardModel {
  getOnboardData = async (
    userId: number,
  ): Promise<OnboardDemander | OnboardSupplier | null> => {
    const connection = await db.getConnection()
    const sql = 'SELECT onboard FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    if (rows[0] == null) return null
    return rows[0]['onboard']
  }

  saveBasicUserData = async (
    userId: number,
    gender: string,
    userType: string,
  ): Promise<void> => {
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

  saveOnboardData = async (
    userId: number,
    data: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const connection = await db.getConnection()
    const sql = 'UPDATE users SET Style=:Style WHERE user_id=:userId'

    const value = { userId, data: JSON.stringify(data) }

    await connection.query(sql, value)
    connection.release()
  }
}
