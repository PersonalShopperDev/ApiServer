import OnboardModel from '../onboard/onboard-model'
import StyleModel from './style-model'
import Data from '../../data/data'

export default class StyleService {
  onboardModel = new OnboardModel()
  model = new StyleModel()

  getStyleTypeList = (M: boolean | undefined, F: boolean | undefined) => {
    const result = {}

    if (M) {
      result['male'] = Data.getStyleList('M')
    }

    if (F) {
      result['female'] = Data.getStyleList('F')
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

  getSupplyGender = async (
    userId: number,
  ): Promise<{ supplyMale: boolean; supplyFemale: boolean }> => {
    const {
      supplyMale,
      supplyFemale,
    } = await this.onboardModel.getSupplyGender(userId)

    return {
      supplyMale,
      supplyFemale,
    }
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
