import ProfileModel from '../onboard/onboard-model'
import { femaleStyleList, maleStyleList } from './style-type'
import StyleModel from './style-model'
import { OnboardSupplier } from '../onboard/onboard-type'

export default class StyleService {
  profileModel = new ProfileModel()
  model = new StyleModel()

  getStyleTypeList = (M: boolean | undefined, F: boolean | undefined) => {
    const result = {}

    if (M) {
      result['male'] = maleStyleList.map((item) => {
        const { id, value } = item
        return { id, value }
      })
    }

    if (F) {
      result['female'] = femaleStyleList.map((item) => {
        const { id, value } = item
        return { id, value }
      })
    }

    return result
  }

  getStyleImgList = (gender: string) => {
    const list = gender == 'M' ? maleStyleList : femaleStyleList
    return list.map((item) => {
      const { id, img } = item
      return { id, img }
    })
  }

  getSupplyGender = async (userId: number): Promise<OnboardSupplier> => {
    const { onboard } = await this.profileModel.getOnboardData(userId)
    if (onboard == null) {
      return {} as OnboardSupplier
    }
    return onboard as OnboardSupplier
  }

  saveStyle = async (userId: number, styles: number[]): Promise<void> => {
    await this.model.deleteStyle(userId)
    await this.model.saveStyle(userId, styles)
  }
}
