import {
  checkProperty,
  OnboardDemander,
  OnboardDemanderGet,
  OnboardDemanderPut,
  OnBoardingDataFields,
  OnboardSupplier,
  OnboardSupplierGet,
  OnboardSupplierPut,
} from './onboard-type'
import OnboardModel from './onboard-model'
import StyleModel from '../style/style-model'

export default class OnboardService {
  model = new OnboardModel()

  getOnboardData = async (
    targetId: number,
  ): Promise<OnboardDemanderGet | OnboardSupplierGet | null> => {
    const onboard = await this.model.getOnboardData(targetId)
    if (onboard == null) return null

    const styles = await StyleModel.getUserStyle(targetId)

    const result = { styles: styles, ...onboard }

    return result as any
  }

  saveOnboardData = async (
    userId: number,
    inputData: OnboardDemanderPut | OnboardSupplierPut,
  ): Promise<void> => {
    const data = {} as OnboardDemander | OnboardSupplier

    for (const k of OnBoardingDataFields) {
      data[k] = inputData[k]
    }

    await this.model.saveBasicUserData(
      userId,
      inputData['gender'],
      inputData['userType'],
    )
    await this.model.saveOnboardData(userId, data)
  }

  updateOnBoardData = async (
    userId: number,
    data: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const baseData = await this.model.getOnboardData(userId)

    if (baseData == null) throw Error

    for (const k of OnBoardingDataFields) {
      if (checkProperty(k, data)) {
        baseData[k] = data[k]
      }
    }

    await this.model.saveOnboardData(userId, baseData)
  }
}
