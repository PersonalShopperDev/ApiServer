import AdminModel from './admin-model'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'
import ChatSocket from '../chat/chat-socket'

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
          // TODO: Career 처리
          // career: item.onboard['career'],
          // careerTxt: this.convertCareer(item.onboard['career']),
          sf: (item.supplyGender & 0x10) === 0x10 ? 'O' : 'X',
          sm: (item.supplyGender & 0x01) === 0x01 ? 'O' : 'X',
        }
      }),
    })

    return page
  }

  getPaymentList = async (): Promise<string> => {
    const data = await this.model.getPaymentList()

    const file = fs.readFileSync(
      path.join(__dirname, '../../../data/admin', 'payment.html'),
      'utf-8',
    )

    const page = ejs.render(file, { list: data })

    return page
  }

  acceptSupplier = async (id: number, career: number): Promise<void> => {
    await this.model.acceptSupplier(id, career)
  }

  acceptPaymentAccount = async (paymentId: number): Promise<void> => {
    await this.model.acceptPaymentAccount(paymentId)
    const roomId = await this.model.getRoomIdByPaymentId(paymentId)

    await ChatSocket.getInstance().sendNotice(roomId, '결제가 완료되었습니다!')
    await ChatSocket.getInstance().notifyChangePayment(roomId)
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
