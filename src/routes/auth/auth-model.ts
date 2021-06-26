import { injectable } from 'inversify'
import 'reflect-metadata'
import axios from 'axios'
import crypto from 'crypto'
import db from '../../config/db'
import jwt from 'jsonwebtoken'

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
    const userManager = new UserManager()
    return await UserManager.updateUserData('naver', userData)
  }
}

@injectable()
export class KaKaoAuth implements AuthThirdParty {
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
        birthday: `${birthyear}${birthday}`,
        phone: mobile,
      }
    } catch (e) {
      return null
    }
  }

  async updateUserData(userData: UserData): Promise<number | null> {
    return await UserManager.updateUserData('kakao', userData)
  }
}

export class TokenManager {
  static generateRefreshToken = async (userId: number): Promise<string> => {
    const refreshToken = crypto.randomBytes(384).toString('base64') // length = 512
    const result = await TokenManager.saveRefreshToken(userId, refreshToken)
    if (!result) {
      return TokenManager.generateRefreshToken(userId)
    }
    return refreshToken
  }

  static checkRefreshToken = async (
    refreshToken: string,
  ): Promise<CheckRefreshTokenResult | null> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT user_id, refresh_token_expire FROM users WHERE refresh_token=:refreshToken'
      const value = { refreshToken }

      const [rows] = await connection.query(sql, value)

      return {
        userId: rows[0].user_id,
        expire: rows[0].refresh_token_expire,
      }
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }

  static generateAccessToken = async (userId: number): Promise<string> => {
    const connection = await db.getConnection()
    const sql =
      'SELECT gender, onboard, s.status FROM users u JOIN stylists s on u.user_id = s.user_id WHERE u.user_id=:userId '
    const value = { userId }

    const [rows] = await connection.query(sql, value)

    const { onboard, gender, status } = rows[0]
    const userType =
      onboard == null ? 'N' : status == null ? 'D' : status == 0 ? 'W' : 'S'

    connection.release()

    return jwt.sign({ userId, gender, userType }, process.env.JWT_KEY, {
      expiresIn: 30 * 60 * 1000,
    })
  }

  private static saveRefreshToken = async (
    userId: number,
    refreshToken: string,
  ): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'UPDATE users SET refresh_token=:refreshToken, refresh_token_expire=DATE_ADD(NOW(), INTERVAL 90 DAY) where user_id=:userId'
      const value = {
        userId,
        refreshToken,
      }

      await connection.query(sql, value)
      return true
    } catch (e) {
      await TokenManager.generateRefreshToken(userId)
      return false
    } finally {
      connection.release()
    }
  }
}

export class UserManager {
  static getUserIdWithThirdPartyID = async (resource: string, id: string) => {
    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT user_id FROM users WHERE third_party=:resource AND third_party_id=:id'
      const value = { resource, id }

      const [rows] = await connection.query(sql, value)
      return rows[0].user_id
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }

  static updateUserData = async (resource: string, userData: UserData) => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO users(birthday, gender, phone, email, third_party, third_party_id)' +
        ' VALUES (:birthday, :gender, :phone, :email, :resource, :id)' +
        ' ON DUPLICATE KEY UPDATE birthday=:birthday,gender=:gender,phone=:phone,email=:email'
      const value = {
        resource,
        id: userData.id,
        birthday: userData.birthday,
        phone: userData.phone,
        gender: userData.gender,
        email: userData.email,
      }

      const [result] = await connection.query(sql, value)
      if ('insertId' in result) {
        if (result.insertId == 0)
          return await UserManager.getUserIdWithThirdPartyID(
            resource,
            userData.id,
          )
        return result.insertId
      }
      return null
    } catch (e) {
      return null
    } finally {
      connection.release()
    }
  }

  static deleteUser = async (userId: number): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      const sql = 'DELETE FROM users WHERE user_id=:userId'
      const value = { userId }
      await connection.query(sql, value)

      return true
    } catch (e) {
      return false
    } finally {
      connection.release()
    }
  }
}
