import { SupplierList } from './supplier-type'
import SupplierModel from './supplier-model'
import StyleModel from '../style/style-model'

export default class SupplierService {
  model = new SupplierModel()

  getList = async (
    userId: number,
    page: number,
    sort: string,
  ): Promise<SupplierList | null> => {
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
  ): Promise<SupplierList | null> => {
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
  ): Promise<SupplierList | null> => {
    const result = await this.model.getSupplierList(typeList, page, sort)
    if (result == null) return null

    const totalCount = await this.model.getSupplierCount(typeList)

    return {
      list: result,
      totalCount: totalCount,
    }
  }
}
