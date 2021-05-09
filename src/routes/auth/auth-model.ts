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
    return null
  }

  async updateUserData(userData: UserData): Promise<number | null> {
    return await updateUserData('kakao', userData)
  }
}

export const createRefreshToken = (userId: number) => {
  // TODO: Refresh 토큰 생성 및 DB 저장
  return 'AASD'
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
      if (result.insertId == 0) return await getUserId(resource, userData.id)
      return result.insertId
    }
    return null
  } catch (e) {
    console.log(e)
    return null
  } finally {
    connection.release()
  }
}

const getUserId = async (resource: string, id: string) => {
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
