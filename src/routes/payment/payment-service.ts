import PaymentModel from './payment-model'
import ChatModel from '../chat/chat-model'
import { Payment } from '../chat/chat-type'

export default class PaymentService {
  model = new PaymentModel()
  chatModel = new ChatModel()

  checkRoom = async (roomId: number, userId: number): Promise<boolean> => {
    const roomData = await this.chatModel.getChatRoom(roomId)

    if (!roomData.users.includes(userId)) return false

    return true
  }

  getPayment = async (roomId: number): Promise<Payment | null> => {
    return await this.chatModel.getLatestPayment(roomId)
  }

  createPayment = async (
    roomId: number,
    userId: number,
  ): Promise<number | null> => {
    const { account, bank } = await this.model.getProfile(userId)

    if (bank == null || account == null) {
      return null
    }

    return await this.model.createPayment(roomId, userId)
  }

  completeAccount = async (paymentId: number, name: string): Promise<void> => {
    await this.model.completeAccount(paymentId, name)
  }
  /*
  getList = async (
    userId: number,
    page: number,
  ): Promise<EstimateHistory[]> => {
    const rawData = await this.model.getList(userId, page)

    return rawData.map((item) => {
      const { paymentTime, price, status, estimateId } = item
      const { userId, name, img } = item
      const targetUser: UserData = {
        userId,
        name,
        img: ResourcePath.profileImg(img),
      }
      return {
        estimateId,
        paymentTime,
        price,
        status,
        targetUser,
      }
    })
  }

  setPayer = async (
    userId: number,
    estimateId: number,
    name: string,
  ): Promise<boolean> => {
    // 권한 없음
    if (!(await this.model.checkEstimate(userId, estimateId))) {
      return false
    }

    return await this.model.setPayer(estimateId, userId, name)
  }

  setPayment = async (estimateId: number): Promise<boolean> => {
    return await this.model.setPayment(estimateId)
  }

  confirmEstimate = async (
    userId: number,
    estimateId: number,
  ): Promise<number> => {
    // 권한 없음
    if (!(await this.model.checkEstimate(userId, estimateId))) {
      return 403
    }

    return (await this.model.confirmCoord(userId, estimateId)) ? 200 : 400
  }
 */
}
