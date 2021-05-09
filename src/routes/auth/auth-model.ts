import { injectable, inject } from 'inversify'
import 'reflect-metadata'
import axios from 'axios'
import crypto from 'crypto'
import db from '../../config/db'

export interface AuthThirdParty {
  login(token: string): Promise<UserData | null>

  updateUserData(userData: UserData): Promise<number | null>
}

export interface AuthToken {
  accessToken: string
  refreshToken?: string
}

interface UserData {
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
    return await updateUserData('naver', userData)
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
    return await updateUserData('kakao', userData)
  }
}

export const createRefreshToken = async (userId: number): Promise<string> => {
  const refreshToken = crypto.randomBytes(384).toString('base64') // length - 512

  const connection = await db.getConnection()
  try {
    const sql =
      'UPDATE users SET refresh_token=:refreshToken, refresh_token_expire=DATE_ADD(NOW(), INTERVAL 90 DAY) where user_id=:userId'
    const value = {
      userId,
      refreshToken,
    }

    await connection.query(sql, value)
    return refreshToken
  } catch (e) {
    return await createRefreshToken(userId)
  } finally {
    connection.release()
  }
}

export const checkRefreshToken = async (
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

export const deleteUser = async (userId: number): Promise<boolean> => {
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

const updateUserData = async (resource: string, userData: UserData) => {
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
        return await getUserIdWithThirdPartyID(resource, userData.id)
      return result.insertId
    }
    return null
  } catch (e) {
    return null
  } finally {
    connection.release()
  }
}

const getUserIdWithThirdPartyID = async (resource: string, id: string) => {
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
