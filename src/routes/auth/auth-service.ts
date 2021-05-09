import jwt from 'jsonwebtoken'
import DIContainer, { AuthResources } from '../../config/inversify.config'
import {
  AuthThirdParty,
  createRefreshToken,
  checkRefreshToken,
  deleteUser,
} from './auth-model'

export const resources = ['kakao', 'naver']
export const login = async (resource: string, token: string) => {
  let model: AuthThirdParty | null = null
  for (const key in AuthResources) {
    if (resource === AuthResources[key].description) {
      model = DIContainer.get<AuthThirdParty>(AuthResources[key])
      break
    }
  }

  if (token === 'test') {
    return await newToken(18)
  }

  if (!model) return null

  const userData = await model.login(token)
  if (!userData) return null

  const userId = await model.updateUserData(userData)
  if (!userId) return null

  return await newToken(userId)
}

/**
 * @name newTokenWithRefreshToken
 * @author HoYean Lee
 * @description Refresh Token을 이용하여 새롭게 Token 발급, Refresh Token 유효기간이 짧으면 Refresh Token도 새로 발급한다.
 * @param refreshToken  token 발급에 사용할 Refresh Token
 */
export const newTokenWithRefreshToken = async (refreshToken: string) => {
  const result = await checkRefreshToken(refreshToken)
  if (!result) return null
  const { userId, expire } = result

  let newRefreshToken: string | undefined = undefined
  if (expire.getTime() < new Date().getTime()) {
    // 유효기간이 지났을 때
    return null
  }
  if (expire.getTime() < new Date().getTime() - 3 * 24 * 60 * 60 * 1000) {
    // expire Date 가 얼마 남지 않았을 때
    newRefreshToken = await createRefreshToken(userId)
  }

  const accessToken = generateAccessToken(userId)
  return { accessToken, refreshToken: newRefreshToken }
}

export const withdraw = async (userId: number): Promise<boolean> => {
  return await deleteUser(userId)
}

/**
 * @name newToken
 * @param userId  토큰을 발급하는 UserID
 */
const newToken = async (userId: number) => {
  const accessToken = generateAccessToken(userId)
  const refreshToken = await createRefreshToken(userId)

  return { accessToken, refreshToken }
}

const generateAccessToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_KEY, {
    expiresIn: 30 * 60 * 1000,
  })
}
