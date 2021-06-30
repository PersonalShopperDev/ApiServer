import { Supplier } from './supplier-type'
import SupplierModel from './supplier-model'

export default class SupplierService {
  model = new SupplierModel()

  getList = async (
    userId: number,
    page: number,
    sort: string,
  ): Promise<Supplier[] | null> => {
    const typeList = await this.model.getStyleTypeId(userId)

    if (typeList == null) {
      return null
    }

    return await this.model.getSupplierList(typeList, page, sort)
  }

  getSearchList = async (
    type: string,
    page: number,
    sort: string,
  ): Promise<Supplier[] | null> => {
    const typeList = type.split('|').map((item) => Number(item))

    return await this.model.getSupplierList(typeList, page, sort, true)
  }
}
