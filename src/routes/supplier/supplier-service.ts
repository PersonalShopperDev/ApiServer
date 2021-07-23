import { Supplier } from './supplier-type'
import SupplierModel from './supplier-model'

export default class SupplierService {
  model = new SupplierModel()

  getList = async (
    userId: number,
    gender: string,
    page: number | undefined,
    sort: string | undefined,
    supplierType: number | number[] | undefined,
  ): Promise<Supplier[] | null> => {
    const typeList = await this.model.getStyleTypeId(userId)

    if (typeList == null) {
      return null
    }

    return await this.model.getSupplierList(
      typeList,
      gender,
      page ?? 0,
      sort ?? 'recommend',
      supplierType,
    )
  }

  getSearchList = async (
    typeList: number | number[],
    gender: string | undefined,
    page: number | undefined,
    sort: string | undefined,
    supplierType: number | number[] | undefined,
  ): Promise<Supplier[] | null> => {
    return await this.model.getSupplierList(
      typeList,
      gender,
      page ?? 0,
      sort ?? 'recommend',
      supplierType,
      true,
    )
  }
}
