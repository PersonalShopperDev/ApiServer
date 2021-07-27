import ChatModel from './estimate-model'

export default class EstimateService {
  model = new ChatModel()

  setPayer = async (
    userId: number,
    estimateId: number,
    name: string,
  ): Promise<boolean> => {
    const clothNum = await this.model.checkEstimate(userId, estimateId)

    if (clothNum == null) {
      // 권한 없음
      return false
    }

    await this.model.setPayer(estimateId, name)

    return true
  }
}
