import {
  checkProperty,
  OnboardDemander,
  OnBoardingDataFields,
  OnboardSupplier,
} from './onboard-type'
import OnboardModel from './onboard-model'

export default class OnboardService {
  model = new OnboardModel()

  getOnboardData = async (
    targetId: number,
  ): Promise<OnboardDemander | OnboardSupplier | null> => {
    const result = await this.model.getOnboardData(targetId)

    if (result == null) return null

    return result
  }

  saveOnboardData = async (
    userId: number,
    inputData: OnboardDemander | OnboardSupplier,
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

  getSupplyGender = async (userId: number): Promise<any> => {
    const result = await this.model.getOnboardData(userId)
    if (result == null) {
      return {}
    }
    return result
  }
}
