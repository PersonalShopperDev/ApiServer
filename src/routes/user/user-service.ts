import { Supplier } from './user-type'
import UserModel from './user-model'

export default class UserService {
  model = new UserModel()

  getSupplierList = async (
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

  getSupplierListFilter = async (
    typeList: number[],
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

  getDemanderList = async (
    userId: number,
    gender: string,
    page: number | undefined,
  ): Promise<Supplier[] | null> => {
    const typeList = await this.model.getStyleTypeId(userId)

    if (typeList == null) {
      return null
    }

    return await this.model.getDemanderList(typeList, gender, page ?? 0)
  }
}
