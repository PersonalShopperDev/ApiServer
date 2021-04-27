import { injectable, inject } from 'inversify'
import 'reflect-metadata'
import axios from 'axios'
import crypto from 'crypto'

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

  createOrGetUser(token: AuthToken): Promise<number> {
    return Promise.resolve(-1)
  }
}

@injectable()
export class KaKaoAuth implements AuthThirdParty {
  async getTokenWithCode(code: string): Promise<AuthToken | null> {
    return null
  }

  async createOrGetUser(token: AuthToken): Promise<number | null> {
    return null
  }
}

export const createRefreshToken = (userId: number) => {
  // TODO: Refresh 토큰 생성 및 DB 저장
  return 'AASD'
}
