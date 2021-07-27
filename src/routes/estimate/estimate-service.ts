import ChatModel from './estimate-model'
import ChatSocket from '../chat/chat-socket'
import { EstimateHistory, UserData } from './estimate-type'
import ResourcePath from '../resource/resource-path'

export default class EstimateService {
  model = new ChatModel()

  getList = async (userId: number): Promise<EstimateHistory[]> => {
    const rawData = await this.model.getList(userId)

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
}
