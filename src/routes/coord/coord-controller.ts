import { Request, Response } from 'express'
import CoordService from './coord-service'
import { validationResult } from 'express-validator'
import { Coord } from './coord-type'
import ChatService from '../chat/chat-service'
import ChatSocket from '../chat/chat-socket'
import ResourcePath from '../resource/resource-path'

export default class CoordController {
  service = new CoordService()
  chatService = new ChatService()

  getCoord = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }

    try {
      const { userId } = req['auth']
      const { coordId } = req.params as any

      const result = await this.service.getCoord(userId, coordId)

      if (result == null) {
        res.sendStatus(403)
        return
      }

      res.status(200).send(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  saveImg = async (req: Request, res: Response): Promise<void> => {
    const img = req['file']
    if (img == null) {
      res.sendStatus(422)
      return
    }

    const { userId, userType } = req['auth']
    if (userType != 'S') {
      res.sendStatus(403)
      return
    }

    try {
      const filePath = await this.service.saveImg(userId, img)
      res.status(200).json({ path: ResourcePath.coordImg(filePath) })
    } catch (e) {
      res.sendStatus(500)
    }
  }

  saveCoord = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!validationResult(req).isEmpty()) {
        res.sendStatus(422)
        return
      }

      const { userId, userType } = req['auth']
      if (userType != 'S') {
        res.sendStatus(403)
        return
      }

      const data: Coord = req.body
      const { roomId } = req.body

      const isMyRoom = await this.chatService.checkRoom(roomId, userId)
      if (isMyRoom == null) {
        res.sendStatus(403)
        return
      }

      const coordId = await this.service.saveCoord(roomId, data)
      if (coordId != null) {
        await ChatSocket.getInstance().sendCoord(
          roomId,
          userId,
          coordId,
          data.title,
          data.clothes.map((item) => item.img),
        )
        res.sendStatus(200)
      } else {
        res.sendStatus(400)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  requestEditCoord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, userType } = req['auth']
      if (userType != 'D') {
        res.sendStatus(403)
        return
      }

      const coordId = req.params.coordId as any

      const roomId = await this.service.requestEditCoord(coordId, userId)

      if (roomId != null) {
        await ChatSocket.getInstance().sendNotice(
          roomId,
          '코디 수정 요청이 들어왔습니다.',
        )
        res.sendStatus(200)
      } else {
        res.sendStatus(400)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  confirmCoord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, userType } = req['auth']
      if (userType != 'D') {
        res.sendStatus(403)
        return
      }

      const coordId = req.params.coordId as any
      const roomId = await this.service.confirmCoord(coordId, userId)

      if (roomId != null) {
        await ChatSocket.getInstance().sendNotice(
          roomId,
          '코디가 확정되었습니다!',
        )
        await ChatSocket.getInstance().notifyChangeStatus(roomId, 3)

        res.sendStatus(200)
      } else {
        res.sendStatus(400)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
