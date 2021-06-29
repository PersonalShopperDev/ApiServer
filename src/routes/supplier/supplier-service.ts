import { Stylist, StylistList } from './supplier-type'
import SupplierModel from './supplier-model'

export default class SupplierService {
  model = new SupplierModel()

  getList = async (
    userId: number,
    page: number,
    sort: string,
  ): Promise<StylistList | null> => {
    const typeList = await this.model.getStyleTypeId(userId)

    if (typeList == null) {
      return null
    }

    return await this.getSupplierList(page, sort, typeList)
  }

  getSearchList = async (
    type: string,
    page: number,
    sort: string,
  ): Promise<StylistList | null> => {
    const typeList = await this.model.convertStyleTypeIdFromString(
      type.replace('|', ','),
    )

    if (typeList == null) {
      return null
    }

    return await this.getSupplierList(page, sort, typeList)
  }

  private getSupplierList = async (
    page: number,
    sort: string,
    typeList: number[],
  ): Promise<StylistList | null> => {
    const result = await this.model.getSupplierList(typeList, page, sort)
    const totalCount = await this.model.getSupplierCount(typeList)

    if (result == null) return null

    return {
      list: result,
      totalCount: totalCount,
    }
  }
}
