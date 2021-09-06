import { OnboardData } from './onboard-type'
import DIContainer from '../../config/inversify.config'
import DB from '../../config/db'

export default class OnboardModel {
  db = DIContainer.get(DB)

  saveBasicUserData = async (userId: number, gender: string): Promise<void> => {
    const sql = 'UPDATE users SET gender=:gender WHERE user_id=:userId;'
    const value = { userId, gender }
    await this.db.query(sql, value)
  }

  createSupplier = async (
    userId: number,
    onboard: OnboardData,
  ): Promise<void> => {
    const sql = `INSERT INTO suppliers(user_id, supplyGender, career) VALUES(:userId, :supplyGender, :career) 
        ON DUPLICATE KEY UPDATE supplyGender=:supplyGender `

    const { supplyMale, supplyFemale, career } = onboard
    const supplyGender = this.getSupplyGenderNumber(supplyMale, supplyFemale)
    const value = { userId, supplyGender, career }

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

  getRandomNickname = async (): Promise<[string, number]> => {
    const sql = `SELECT name, number FROM nicknames ORDER BY rand()`

    const [rows] = await this.db.query(sql)

    return [rows[0].name, rows[0].number]
  }

  increaseNicknameCount = async (nickname: string): Promise<void> => {
    const sql = `UPDATE nicknames SET number = number + 1 where name=:nickname`
    await this.db.query(sql, { nickname })
  }
}
