import DIContainer from '../../config/inversify.config'
import ProfileModel from '../profile/profile-model'
import { maleSyleList, femaleStyleList } from './style'

export default class StyleService {
  model = new ProfileModel()

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

  getSupplyGender = async (userId: number): Promise<any> => {
    const result = await this.model.getOnBoardData(userId)
    if (result == null) {
      return {}
    }
    return result
  }
}
