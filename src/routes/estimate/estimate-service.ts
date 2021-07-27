import ChatModel from './estimate-model'
import ChatSocket from '../chat/chat-socket'

export default class EstimateService {
  model = new ChatModel()

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

    if (!(await ChatSocket.getInstance().changeStatus(estimateId, userId, 5))) {
      return 400
    }

    return 200
  }
}
