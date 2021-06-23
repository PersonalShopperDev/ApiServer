import ProfileModel from '../onboard/onboard-model'
import { femaleStyleList, maleSyleList } from './style'
import StyleModel from './style-model'
import { OnboardSupplier } from '../onboard/onboard-type'

export default class StyleService {
  profileModel = new ProfileModel()
  model = new StyleModel()

  getStyleTypeList = (M: boolean, F: boolean) => {
    const result = {}

    if (M) {
      result['male'] = maleSyleList.map((item) => {
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
    const list = gender == 'M' ? maleSyleList : femaleStyleList
    return list.map((item) => {
      const { id, img } = item
      return { id, img }
    })
  }

  getSupplyGender = async (userId: number): Promise<OnboardSupplier> => {
    const result = await this.profileModel.getOnboardData(userId)
    if (result == null) {
      return {} as OnboardSupplier
    }
    return result as OnboardSupplier
  }

  saveStyle = async (userId: number, styles: number[]): Promise<void> => {
    await this.model.deleteStyle(userId)
    await this.model.saveStyle(userId, styles)
  }
}
