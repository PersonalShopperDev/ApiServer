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
    const { gender, onboard } = await this.model.getOnboardData(targetId)
    if (onboard == null) return null

    const styles = await StyleModel.getUserStyle(targetId)

    const result = { styles: styles, gender, ...onboard }

    if (onboard['career'] != null) {
      const { supplyMale, supplyFemale } = await this.model.getSupplyGender(
        targetId,
      )
      result['supplyMale'] = supplyMale
      result['supplyFemale'] = supplyFemale
    }

    return result as any
  }

  saveDemander = async (
    userId: number,
    inputData: OnboardDemanderPut,
  ): Promise<void> => {
    const data = {} as OnboardDemander

    for (const k of OnBoardingDataFields) {
      data[k] = inputData[k]
    }

    await this.model.saveBasicUserData(userId, inputData['gender'], data)
  }

  saveSupplier = async (
    userId: number,
    inputData: OnboardSupplierPut,
  ): Promise<void> => {
    const data = {} as OnboardSupplier

    for (const k of OnBoardingDataFields) {
      data[k] = inputData[k]
    }

    await this.model.saveBasicUserData(userId, inputData['gender'], data)

    const { supplyMale, supplyFemale } = inputData

    await this.model.newSupplier(userId, supplyMale, supplyFemale)
  }

  updateOnBoardData = async (
    userId: number,
    userType: string,
    data: OnboardDemander | OnboardSupplier,
  ): Promise<void> => {
    const { onboard } = await this.model.getOnboardData(userId)

    if (onboard == null) throw Error

    for (const k of OnBoardingDataFields) {
      if (checkProperty(k, data)) {
        onboard[k] = data[k]
      }
    }

    await this.model.saveOnboardData(userId, onboard)

    if (userType == 'W' || userType == 'S') {
      const { supplyMale, supplyFemale } = data as OnboardSupplier
      if (supplyMale || supplyFemale)
        await this.model.saveSupplyGender(userId, supplyMale, supplyFemale)
    }
  }
}
