import { RowDataPacket } from 'mysql2'
import { OnboardDemander, OnboardSupplier } from './onboard-type'
import DIContainer from '../../config/inversify.config'
import DB from '../../config/db'

export default class OnboardModel {
  db = DIContainer.get(DB)

  getOnboardData = async (
    userId: number,
  ): Promise<{
    gender: string | undefined
    onboard: OnboardDemander | OnboardSupplier | undefined
  }> => {
    const sql = 'SELECT gender, onboard FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await this.db.query(sql, value)) as RowDataPacket[]

    if (rows[0] == null)
      return {
        gender: undefined,
        onboard: undefined,
      }

    return rows[0]
  }

  saveBasicUserData = async (
    userId: number,
    gender: string,
    onboard: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const sql =
      'UPDATE users SET gender=:gender, onboard=:onboard WHERE user_id=:userId;'
    const value = { userId, gender, onboard: JSON.stringify(onboard) }

    await this.db.query(sql, value)
  }

  newSupplier = async (
    userId: number,
    supplyMale: boolean | undefined,
    supplyFemale: boolean | undefined,
  ): Promise<void> => {
    const sql = `INSERT INTO suppliers(user_id, supplyGender) VALUES(:userId, :supplyGender) 
        ON DUPLICATE KEY UPDATE supplyGender=:supplyGender `

    const supplyGender = this.getSupplyGenderNumber(supplyMale, supplyFemale)
    const value = { userId, supplyGender }

    await this.db.query(sql, value)
  }

  saveOnboardData = async (
    userId: number,
    onboard: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const sql = 'UPDATE users SET onboard=:onboard WHERE user_id=:userId'

    const value = { userId, onboard: JSON.stringify(onboard) }

    await this.db.query(sql, value)
  }

  saveSupplyGender = async (
    userId: number,
    supplyMale: boolean | undefined,
    supplyFemale: boolean | undefined,
  ): Promise<void> => {
    const sql = `UPDATE suppliers SET supplyGender=:supplyGender WHERE user_id=:userId`

    const supplyGender = this.getSupplyGenderNumber(supplyMale, supplyFemale)

    const value = { userId, supplyGender }

    await this.db.query(sql, value)
  }

  getSupplyGender = async (
    userId: number,
  ): Promise<{
    supplyMale: boolean
    supplyFemale: boolean
  }> => {
    const sql = 'SELECT supplyGender FROM suppliers WHERE user_id=:userId'

    const value = { userId }

    const [rows] = await this.db.query(sql, value)
    const supplyGender = rows[0].supplyGender[0]

    return {
      supplyMale: (supplyGender & 0b01) > 0,
      supplyFemale: (supplyGender & 0b10) > 0,
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
