import { Stylist } from './style-type'
import StyleModel from './style-model'

export default class StylistService {
  model = new StyleModel()

  getList = async (
    userId: number,
    page: number,
    sort: string,
  ): Promise<Array<Stylist> | null> => {
    const typeList = await this.model.getStyleTypeId(userId)

    if (typeList == null) {
      return null
    }

    return await this.getStylistList(page, sort, typeList)
  }

  getSearchList = async (
    type: string,
    page: number,
    sort: string,
  ): Promise<Array<Stylist> | null> => {
    const typeList = await this.model.convertStyleTypeIdFromString(
      type.replace('|', ','),
    )

    if (typeList == null) {
      return null
    }

    return await this.getStylistList(page, sort, typeList)
  }

  private getStylistList = async (
    page: number,
    sort: string,
    typeList: number[],
  ): Promise<Array<Stylist> | null> => {
    return await this.model.getStylists(typeList, page, sort)
  }
}
