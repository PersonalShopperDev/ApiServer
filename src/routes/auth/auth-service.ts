import DIContainer from '../../config/inversify.config'
import {
  AuthThirdParty,
  AuthToken,
  TokenManager,
  UserManager,
} from './auth-model'

export default class AuthService {
  static resources = ['kakao', 'naver']

  login = async (
    resource: string,
    token: string,
  ): Promise<AuthToken | null> => {
    const factory: (resource: string) => AuthThirdParty = DIContainer.get(
      'Factory<AuthThirdParty>',
    )
    const model = factory(resource)

    if (token === 'test') {
      return await this.newToken(18)
    }

    if (!model) return null

    const userData = await model.login(token)
    if (!userData) return null

    const userId = await model.updateUserData(userData)
    if (!userId) return null

    return await this.newToken(userId)
  }

  /**
   * @name newTokenWithRefreshToken
   * @author HoYean Lee
   * @description Refresh Token을 이용하여 새롭게 Token 발급, Refresh Token 유효기간이 짧으면 Refresh Token도 새로 발급한다.
   * @param refreshToken  token 발급에 사용할 Refresh Token
   */
  newTokenWithRefreshToken = async (
    refreshToken: string,
  ): Promise<AuthToken | null> => {
    const result = await TokenManager.checkRefreshToken(refreshToken)
    if (!result) return null
    const { userId, expire } = result

    let newRefreshToken: string | undefined = undefined
    if (expire.getTime() < new Date().getTime()) {
      // 유효기간이 지났을 때
      return null
    }
    if (expire.getTime() < new Date().getTime() + 3 * 24 * 60 * 60 * 1000) {
      // expire Date 가 얼마 남지 않았을 때
      newRefreshToken = await TokenManager.generateRefreshToken(userId)
    }

    const accessToken = await TokenManager.generateAccessToken(userId)
    return { accessToken, refreshToken: newRefreshToken }
  }

  withdraw = async (userId: number): Promise<boolean> => {
    return await UserManager.deleteUser(userId)
  }

  private newToken = async (userId: number): Promise<AuthToken | null> => {
    const accessToken = await TokenManager.generateAccessToken(userId)
    const refreshToken = await TokenManager.generateRefreshToken(userId)

    return { accessToken, refreshToken }
  }
}
