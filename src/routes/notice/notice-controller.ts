import { Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import NoticeService from './notice-service'

export default class NoticeController {
  service = new NoticeService()

  getNoticeList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userType } = req['auth']
      const { page } = req.query as any
      const result = await this.service.getNoticeList(userType, page)

      if (result == null) {
        res.sendStatus(400)
      } else {
        res.status(200).json(result)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
