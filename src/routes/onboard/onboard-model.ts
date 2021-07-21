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
    onboard: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'UPDATE users SET gender=:gender, onboard=:onboard WHERE user_id=:userId;'
      const value = { userId, gender, onboard: JSON.stringify(onboard) }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  newSupplier = async (
    userId: number,
    supplyMale: boolean | undefined,
    supplyFemale: boolean | undefined,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `INSERT INTO suppliers(user_id, supplyGender) VALUES(:userId, :supplyGender) 
        ON DUPLICATE KEY UPDATE supplyGender=:supplyGender `

      const supplyGender = this.getSupplyGenderNumber(supplyMale, supplyFemale)
      const value = { userId, supplyGender }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveOnboardData = async (
    userId: number,
    onboard: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = 'UPDATE users SET onboard=:onboard WHERE user_id=:userId'

      const value = { userId, onboard: JSON.stringify(onboard) }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveSupplyGender = async (
    userId: number,
    supplyMale: boolean | undefined,
    supplyFemale: boolean | undefined,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE suppliers SET supplyGender=:supplyGender WHERE user_id=:userId`

      const supplyGender = this.getSupplyGenderNumber(supplyMale, supplyFemale)

      const value = { userId, supplyGender }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getSupplyGender = async (
    userId: number,
  ): Promise<{
    supplyMale: boolean
    supplyFemale: boolean
  }> => {
    const connection = await db.getConnection()
    try {
      const sql = 'SELECT supplyGender FROM suppliers WHERE user_id=:userId'

      const value = { userId }

      const [rows] = await connection.query(sql, value)
      const supplyGender = rows[0].supplyGender[0]

      return {
        supplyMale: (supplyGender & 0b01) > 0,
        supplyFemale: (supplyGender & 0b10) > 0,
      }
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  private getSupplyGenderNumber = (
    supplyMale: boolean | undefined,
    supplyFemale: boolean | undefined,
  ): number => {
    let supplyGender = 0b00
    if (supplyMale) {
      supplyGender |= 0b01
    }
    if (supplyFemale) {
      supplyGender |= 0b10
    }

    return supplyGender
  }
}
