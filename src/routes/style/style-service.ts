import ProfileModel from '../onboard/onboard-model'
import StyleModel from './style-model'
import { OnboardSupplier } from '../onboard/onboard-type'
import Data from '../../data/data'

export default class StyleService {
  profileModel = new ProfileModel()
  model = new StyleModel()

  getStyleTypeList = (M: boolean | undefined, F: boolean | undefined) => {
    const result = {}

    if (M) {
      result['male'] = Data.getStyleList('M')
    }

    if (F) {
      result['male'] = Data.getStyleList('F')
    }

    return result
  }

  getStyleImgList = (gender: string): { id: number; img: string }[] => {
    const array = Data.getStyleImgList(gender)
    let currentIndex = array.length
    let randomIndex: number

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]
    }
    return array
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

  saveStyleByImg = async (userId: number, imgs: number[]): Promise<void> => {
    await this.model.deleteStyle(userId)

    const styles = new Set<number>(Data.convertImgToStyle(imgs))

    await this.model.saveStyle(userId, [...styles])
  }
}
