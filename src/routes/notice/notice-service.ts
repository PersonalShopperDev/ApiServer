import NoticeModel from './notice-model'
import { Notice } from './notice-type'

export default class NoticeService {
  model = new NoticeModel()

  getNoticeList = async (
    userType: string | undefined,
    page: number | undefined,
  ): Promise<Notice[]> => {
    return await this.model.getNoticeList(userType, page ?? 0)
  }
}
