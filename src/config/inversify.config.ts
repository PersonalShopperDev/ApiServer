import { Container } from 'inversify'
import { AuthThirdParty, NaverAuth, KaKaoAuth } from '../routes/auth/auth-model'

export const AuthResources = {
  Kakao: Symbol('kaKao'),
  Naver: Symbol('naver'),
}

const DIContainer = new Container()
DIContainer.bind<AuthThirdParty>(AuthResources.Kakao).to(KaKaoAuth)
DIContainer.bind<AuthThirdParty>(AuthResources.Naver).to(NaverAuth)

export default DIContainer
