import { injectable } from 'inversify'
import axios from 'axios'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import DIContainer from '../../config/inversify.config'
import DB from '../../config/db'

export interface AuthThirdParty {
  login(token: string): Promise<UserData | null>

  updateUserData(userData: UserData): Promise<number | null>
}

export interface AuthToken {
  accessToken: string
  refreshToken?: string
}

type UserData = {
  id: string
  gender?: string
  birthday?: string
  phone?: string
  email?: string
}

type CheckRefreshTokenResult = {
  userId: number
  expire: Date
}

@injectable()
export class NaverAuth implements AuthThirdParty {
  userManager = new UserManager()

  async login(token: string): Promise<UserData | null> {
    try {
      const result = await axios.get<UserData>(
        `https://openapi.naver.com/v1/nid/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const { id, gender, birthday, birthyear, mobile, email } = result.data[
        'response'
      ]

      return {
        id,
        gender,
        email,
        birthday: `${birthyear}-${birthday}`,
        phone: mobile,
      }
    } catch (e) {
      return null
    }
  }

  async updateUserData(userData: UserData): Promise<number | null> {
    return await this.userManager.updateUserData('naver', userData)
  }
}

@injectable()
export class KaKaoAuth implements AuthThirdParty {
  userManager = new UserManager()

  async login(token: string): Promise<UserData | null> {
    try {
      const result = await axios.get<UserData>(
        `https://kapi.kakao.com/v2/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const { id } = result.data
      const {
        gender,
        birthday,
        has_gender,
        // birthyear, TODO
        mobile,
        email,
      } = result.data['kakao_account']

      const birthyear = '00'

      return {
        id: String(id),
        gender: has_gender ? (gender === 'female' ? 'F' : 'M') : undefined,
        email,
        // birthday: `${birthyear}${birthday}`,
        phone: mobile,
      }
    } catch (e) {
      return null
    }
  }

  async updateUserData(userData: UserData): Promise<number | null> {
    return await this.userManager.updateUserData('kakao', userData)
  }
}

export class TokenManager {
  db = DIContainer.get(DB)

  generateRefreshToken = async (userId: number): Promise<string> => {
    const refreshToken = crypto.randomBytes(384).toString('base64') // length = 512
    const result = await this.saveRefreshToken(userId, refreshToken)
    if (!result) {
      return this.generateRefreshToken(userId)
    }
    return refreshToken
  }

  checkRefreshToken = async (
    refreshToken: string,
  ): Promise<CheckRefreshTokenResult | null> => {
    const sql =
      'SELECT user_id, refresh_token_expire FROM users WHERE refresh_token=:refreshToken'
    const value = { refreshToken }

    const [rows] = await this.db.query(sql, value)

    if (rows[0] == null) return null
    return {
      userId: rows[0].user_id,
      expire: rows[0].refresh_token_expire,
    }
  }

  generateAccessToken = async (userId: number): Promise<string> => {
    const sql =
      'SELECT gender, onboard, u.email, s.status FROM users u LEFT JOIN suppliers s on u.user_id = s.user_id WHERE u.user_id=:userId '
    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    const { onboard, gender, status, email } = rows[0]
    const userType =
      onboard == null ? 'N' : status == null ? 'D' : status == -1 ? 'W' : 'S'

    return jwt.sign({ userId, gender, userType, email }, process.env.JWT_KEY, {
      expiresIn:
        process.env.NODE_MODE == 'development' ? 60 * 60 * 24 * 30 : 60 * 60,
    })
  }

  /**
   * @name saveRefreshToken
   * @param userId
   * @param refreshToken
   * @return boolean: 저장 성공 여부
   */
  private saveRefreshToken = async (
    userId: number,
    refreshToken: string,
  ): Promise<boolean> => {
    const sql =
      'UPDATE users SET refresh_token=:refreshToken, refresh_token_expire=DATE_ADD(NOW(), INTERVAL 90 DAY) where user_id=:userId'
    const value = {
      userId,
      refreshToken,
    }

    await this.db.query(sql, value)
    return true
  }
}

export class UserManager {
  db = DIContainer.get(DB)

  getUserType = async (userId: number): Promise<string> => {
    const sql =
      'SELECT onboard, s.status FROM users u LEFT JOIN suppliers s on u.user_id = s.user_id WHERE u.user_id=:userId '
    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    const { onboard, status } = rows[0]
    const userType =
      onboard == null ? 'N' : status == null ? 'D' : status == -1 ? 'W' : 'S'
    return userType
  }
  getUserIdWithThirdPartyID = async (resource: string, id: string) => {
    const sql =
      'SELECT user_id FROM users WHERE third_party=:resource AND third_party_id=:id'
    const value = { resource, id }

    const [rows] = await this.db.query(sql, value)
    if (rows[0] == null) return null
    return rows[0].user_id
  }

  updateUserData = async (resource: string, userData: UserData) => {
    const sql =
      'INSERT IGNORE INTO users(birthday, gender, phone, email, third_party, third_party_id)' +
      ' VALUES (:birthday, :gender, :phone, :email, :resource, :id)' +
      (userData.email != null ? ' ON DUPLICATE KEY UPDATE email=:email' : '')
    const value = {
      resource,
      id: userData.id,
      birthday: userData.birthday,
      phone: userData.phone,
      gender: userData.gender,
      email: userData.email,
    }

    const [result] = await this.db.query(sql, value)
    if ('insertId' in result) {
      if (result.insertId == 0)
        return await this.getUserIdWithThirdPartyID(resource, userData.id)
      return result.insertId
    }
    return null
  }

  deleteUser = async (userId: number): Promise<boolean> => {
    try {
      const sql = 'DELETE FROM users WHERE user_id=:userId'
      const value = { userId }
      await this.db.query(sql, value)
      return true
    } catch (e) {
      return false
    }
  }

  getAgreement = async (
    userId: number,
  ): Promise<{
    terms: number
    privacy: number
  }> => {
    const sql =
      'SELECT agreement_terms as terms, agreement_privacy as privacy FROM users WHERE user_id=:userId'
    const value = { userId }
    const [rows] = await this.db.query(sql, value)

    return rows[0]
  }

  setAgreement = async (
    userId: number,
    terms: number,
    privacy: number,
  ): Promise<void> => {
    const sql =
      'UPDATE users SET agreement_terms=:terms, agreement_privacy=:privacy WHERE user_id=:userId'
    const value = { userId, terms, privacy }
    await this.db.query(sql, value)
  }
}
