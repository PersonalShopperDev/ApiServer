import { OnboardData } from './onboard-type'
import OnboardModel from './onboard-model'
import StyleModel from '../style/style-model'
import DIContainer from '../../config/inversify.config'

export default class OnboardService {
  model = new OnboardModel()
  styleModel = DIContainer.get(StyleModel)

  createUser = async (userId: number, data: OnboardData): Promise<void> => {
    await this.model.saveBasicUserData(userId, data.gender)
    if (data.userType == 'S') {
      await this.model.createSupplier(userId, data)
    }
  }

  getRandomNickname = async (): Promise<string> => {
    const [nickname, number] = await this.model.getRandomNickname()
    await this.model.increaseNicknameCount(nickname)

    return `${nickname}${number}`
  }
}
