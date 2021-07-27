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

    await this.model.setPayer(estimateId, name)

    return true
  }

  confirmEstimate = async (
    userId: number,
    estimateId: number,
  ): Promise<number> => {
    // 권한 없음
    if (!(await this.model.checkEstimate(userId, estimateId))) {
      return 403
    }

    if (!(await ChatSocket.getInstance().onChangeStatus(estimateId, 5))) {
      return 400
    }

    return 200
  }
}
