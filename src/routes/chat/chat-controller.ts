import { Request, Response } from 'express'
import ChatService from './chat-service'
import { validationResult } from 'express-validator'
import { ImgFile } from '../../types/upload'

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

  getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const roomId = Number(req.params.roomId)
      const { olderChatId } = req.query as any

      const targetId = await this.service.checkRoom(roomId, userId)

      if (targetId == null) {
        res.sendStatus(403)
        return
      }

      const chatList = await this.service.getChatHistory(
        userId,
        roomId,
        olderChatId,
      )
      const targetUser = await this.service.getProfile(targetId)
      const latestEstimate = await this.service.getLatestEstimate(roomId)

      res.status(200).json({
        chatList,
        latestEstimate,
        targetUser,
      })
    } catch (e) {
      res.sendStatus(500)
    }
  }

  postImg = async (req: Request, res: Response): Promise<void> => {
    const img: ImgFile = req['file']
    if (!validationResult(req).isEmpty() || img == null) {
      res.sendStatus(422)
      return
    }

    try {
      const { userId } = req['auth']
      const roomId = Number(req.params.roomId)

      const targetId = await this.service.checkRoom(roomId, userId)

      if (targetId == null) {
        res.sendStatus(403)
        return
      }

      await this.service.sendImg(roomId, userId, img)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
