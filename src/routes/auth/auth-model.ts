import { injectable, inject } from 'inversify'
import 'reflect-metadata'
import axios from 'axios'
import crypto from 'crypto'
import db from '../../config/db'

export interface AuthThirdParty {
  getTokenWithCode(code: string): Promise<AuthToken | null>
  createOrGetUser(token: AuthToken): Promise<number | null>
}

export interface AuthToken {
  accessToken: string
  refreshToken?: string
}

interface NaverResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

@injectable()
export class NaverAuth implements AuthThirdParty {
  async getTokenWithCode(code: string): Promise<AuthToken | null> {
    const state = crypto.randomBytes(10).toString('hex')

    try {
      const result = await axios.post<NaverResponse>(
        'https://nid.naver.com/oauth2.0/token',
        {
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID,
          client_secret: process.env.NAVER_CLIENT_SECRET,
          code,
          state: encodeURIComponent(state),
        },
      )
      const { access_token, refresh_token } = result.data
      if (access_token && refresh_token)
        return {
          accessToken: access_token,
          refreshToken: refresh_token,
        }
      else return null
    } catch (e) {
      return null
    }
  }

  async createOrGetUser(token: AuthToken): Promise<number | null> {
    return await createOrGetUser('naver', token)
  }
}

@injectable()
export class KaKaoAuth implements AuthThirdParty {
  async getTokenWithCode(code: string): Promise<AuthToken | null> {
    return null
  }

  async createOrGetUser(token: AuthToken): Promise<number | null> {
    return await createOrGetUser('kakao', token)
  }
}

export const createRefreshToken = (userId: number) => {
  // TODO: Refresh 토큰 생성 및 DB 저장
  return 'AASD'
}

const createOrGetUser = async (resource: string, token: AuthToken) => {
  if (!token.refreshToken) return null
  let userId = await getUserId(resource, token.refreshToken)
  if (!userId) {
    userId = await createUser(resource, token.refreshToken)
  }
  if (!userId) {
    return null
  }
  return userId
}

const getUserId = async (resource: string, refreshToken: string) => {
  const connection = await db.getConnection()
  try {
    const sql =
      'SELECT `user_id` FROM `users` WHERE `third_party`=:resource and `third_party_refresh`=:refresh_token'
    const value = { resource, refreshToken }

    const [rows] = await connection.query(sql, value)
    return rows[0].user_id
  } catch (e) {
    return null
  } finally {
    connection.release()
  }
}

const createUser = async (resource: string, refreshToken: string) => {
  const connection = await db.getConnection()
  try {
    const sql =
      'INSERT INTO `users`(`third_party`, `third_party_refresh`) VALUES (:resource, :refreshToken)'
    const value = { resource, refreshToken }

    const [result] = await connection.query(sql, value)
    if ('insertId' in result) return result.insertId

    return null
  } catch (e) {
    return null
  } finally {
    connection.release()
  }
}
