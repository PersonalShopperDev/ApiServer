import { Request, Response } from 'express'
import ChatService from './chat-service'

export default class ChatController {
  service = new ChatService()

  getChatList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const result = await this.service.getChatList(userId)

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
      const { userId } = req['auth']
      const { targetId } = req.body
      const result = await this.service.newChatList(userId, targetId)

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
