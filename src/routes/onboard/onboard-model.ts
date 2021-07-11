import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'
import { OnboardDemander, OnboardSupplier } from './onboard-type'

export default class OnboardModel {
  getOnboardData = async (
    userId: number,
  ): Promise<{
    gender: string | undefined
    onboard: OnboardDemander | OnboardSupplier | undefined
  }> => {
    const connection = await db.getConnection()
    try {
      const sql = 'SELECT gender, onboard FROM users WHERE user_id=:userId'

      const value = { userId }

      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      if (rows[0] == null)
        return {
          gender: undefined,
          onboard: undefined,
        }

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveBasicUserData = async (
    userId: number,
    gender: string,
    userType: string,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const value = { userId, gender }

      const sql = 'UPDATE users SET gender=:gender WHERE user_id=:userId;'
      await connection.query(sql, value)

      if (userType == 'S') {
        const sql2 =
          'INSERT IGNORE INTO suppliers(user_id, status) VALUES(:userId, 0);'
        await connection.query(sql2, value)
      }
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveOnboardData = async (
    userId: number,
    data: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = 'UPDATE users SET onboard=:onboard WHERE user_id=:userId'

      const value = { userId, onboard: JSON.stringify(data) }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
