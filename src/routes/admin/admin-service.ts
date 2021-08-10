import AdminModel from './admin-model'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'

export default class AdminService {
  model = new AdminModel()
  getSupplierList = async (): Promise<string> => {
    const data = await this.model.getSupplierList()

    const file = fs.readFileSync(
      path.join(__dirname, '../../../data/admin', 'supplier.html'),
      'utf-8',
    )

    const page = ejs.render(file, {
      list: data.map((item) => {
        return {
          ...item,
          career: item.onboard['career'],
          careerTxt: this.convertCareer(item.onboard['career']),
          sf: (item.supplyGender & 0x10) === 0x10 ? 'O' : 'X',
          sm: (item.supplyGender & 0x01) === 0x01 ? 'O' : 'X',
        }
      }),
    })

    return page
  }

  acceptSupplier = async (id: number, career: number): Promise<void> => {
    await this.model.acceptSupplier(id, career)
  }

  private convertCareer = (careerId: number): string => {
    switch (careerId) {
      case 0:
        return '일반인'
      case 1:
        return 'SNS'
      case 2:
        return '전문'
    }

    return 'ERR'
  }
}
