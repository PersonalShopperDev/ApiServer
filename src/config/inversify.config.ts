import { Container, interfaces } from 'inversify'
import {
  AuthThirdParty,
  NaverAuth,
  KaKaoAuth,
  UserManager,
} from '../routes/auth/auth-model'
import S3 from './s3'
import ProfileModel from '../routes/profile/profile-model'
import DB from './db'
import ProfileService from '../routes/profile/profile-service'
import ProfileController from '../routes/profile/profile-controller'
import StyleModel from '../routes/style/style-model'

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
DIContainer.bind<S3>(S3).toSelf().inSingletonScope()
DIContainer.bind<DB>(DB).toSelf().inSingletonScope()

DIContainer.bind<UserManager>(UserManager).toSelf().inSingletonScope()

DIContainer.bind<ProfileController>(ProfileController)
  .toSelf()
  .inSingletonScope()
DIContainer.bind<ProfileService>(ProfileService).toSelf().inSingletonScope()
DIContainer.bind<ProfileModel>(ProfileModel).toSelf().inSingletonScope()

DIContainer.bind<StyleModel>(StyleModel).toSelf().inSingletonScope()

export default DIContainer
