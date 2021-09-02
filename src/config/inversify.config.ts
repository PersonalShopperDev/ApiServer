import { Container, interfaces } from 'inversify'
import { AuthThirdParty, NaverAuth, KaKaoAuth } from '../routes/auth/auth-model'
import S3 from './s3'
import ProfileModel from '../routes/profile/profile-model'
import DB from './db'

const DIContainer = new Container()

DIContainer.bind<AuthThirdParty>('AuthThirdParty')
  .to(NaverAuth)
  .whenTargetNamed('naver')
DIContainer.bind<AuthThirdParty>('AuthThirdParty')
  .to(KaKaoAuth)
  .whenTargetNamed('kakao')

DIContainer.bind<interfaces.Factory<AuthThirdParty>>(
  'Factory<AuthThirdParty>',
).toFactory<AuthThirdParty>((context: interfaces.Context) => {
  return (resource: string) => {
    return context.container.getNamed<AuthThirdParty>(
      'AuthThirdParty',
      resource.toLowerCase(),
    )
  }
})

// region Model
DIContainer.bind<S3>(S3).toSelf().inSingletonScope()
DIContainer.bind<DB>(DB).toSelf().inSingletonScope()
DIContainer.bind<ProfileModel>(ProfileModel).toSelf().inSingletonScope()

// endregion

export default DIContainer
