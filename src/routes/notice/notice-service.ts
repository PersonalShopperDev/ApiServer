import NoticeModel from './notice-model'
import { Notice } from './notice-type'

export default class NoticeService {
  model = new NoticeModel()

  getNotice = async (
    userType: string | undefined,
    noticeId: number,
  ): Promise<Notice | null> => {
    return await this.model.getNotice(userType, noticeId)
  }

  getNoticeList = async (
    userType: string | undefined,
    page: number | undefined,
  ): Promise<Notice[]> => {
    return await this.model.getNoticeList(userType, page ?? 0)
  }
}
