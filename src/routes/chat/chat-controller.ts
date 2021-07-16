import { Request, Response } from 'express'
import ChatService from './chat-service'

export default class ChatController {
  service = new ChatService()

  getChatList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const { page } = req.query as any
      const result = await this.service.getChatList(userId, page || 0)

      if (result == null) {
        res.sendStatus(400)
      } else {
        res.status(200).json(result)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  newChatList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, userType } = req['auth']
      const { targetId } = req.body
      const result = await this.service.newChatList(userId, userType, targetId)

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
