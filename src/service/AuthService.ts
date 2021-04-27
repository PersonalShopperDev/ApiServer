import jwt from 'jsonwebtoken'
import DIContainer, { AuthResources } from '../config/inversify.config'
import { AuthThirdParty, createRefreshToken } from '../model/AuthModel'

export const resources = ['kakao', 'naver']
export const getTokenWithThirdParty = async (
  resource: string,
  code: string,
) => {
  let model: AuthThirdParty | null = null
  for (const key in AuthResources) {
    if (resource === AuthResources[key].description) {
      model = DIContainer.get<AuthThirdParty>(AuthResources[key])
      break
    }
  }

  if (!model) return null

  const authToken = await model.getTokenWithCode(code)
  if (!authToken) return null

  const userId = await model.createOrGetUser(authToken)
  if (!userId) return null

  return newToken(userId)
}

/**
 * @name newTokenWithRefreshToken
 * @author HoYean Lee
 * @description Refresh Token을 이용하여 새롭게 Token 발급, Refresh Token 유효기간이 짧으면 Refresh Token도 새로 발급한다.
 * @param refreshToken  token 발급에 사용할 Refresh Token
 */
export const newTokenWithRefreshToken = (refreshToken: string) => {
  // TODO: Refresh Token 검증

  // TODO: Refresh Token 짧을 경우 newToken()
  const userId = 0

  const accessToken = generateAccessToken(userId)
  return { accessToken }
}

/**
 * @name newToken
 * @param userId  토큰을 발급하는 UserID
 */
const newToken = (userId: number) => {
  const accessToken = generateAccessToken(userId)
  const refreshToken = createRefreshToken(userId)

  return { accessToken, refreshToken }
}

const generateAccessToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_KEY, {
    expiresIn: 30 * 60 * 1000,
  })
}
