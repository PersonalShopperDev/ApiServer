import { Request, Response } from 'express'
import CoordService from './coord-service'
import { validationResult } from 'express-validator'
import ChatSocket from '../chat/chat-socket'
import ResourcePath from '../resource/resource-path'
import { Coord } from './coord-type'
import ChatService from '../chat/chat-service'

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
      const { coordId } = req.query as any

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

  newCoord = async (req: Request, res: Response): Promise<void> => {
    const mainImg = req['file']

    if (!validationResult(req).isEmpty() || mainImg == null) {
      res.sendStatus(422)
      return
    }

    const { userId, userType } = req['auth']

    if (userType != 'S') {
      res.sendStatus(403)
      return
    }

    const { demanderId, title, comment } = req.body

    try {
      const data = await this.service.newCoord(
        demanderId,
        userId,
        title,
        comment,
      )

      if (data == null) {
        res.sendStatus(403)
        return
      }

      const { coordId, roomId } = data

      const imgUrl = await this.service.saveMainImg(coordId, mainImg)

      await ChatSocket.getInstance().sendCoord(
        roomId,
        userId,
        coordId,
        title,
        ResourcePath.coordImg(imgUrl),
      )

      res.status(200).send({ coordId })
    } catch (e) {
      res.sendStatus(500)
    }
  }

  addCloth = async (req: Request, res: Response): Promise<void> => {
    const img = req['file']

    if (!validationResult(req).isEmpty() || img == null) {
      res.sendStatus(422)
      return
    }

    const { userId, userType } = req['auth']

    if (userType != 'S') {
      res.sendStatus(403)
      return
    }

    try {
      const { coordId, name, price, purchaseUrl } = req.body
      const cloth = { img, name, price, purchaseUrl }
      const result = await this.service.addCloth(coordId, userId, cloth)

      if (!result) {
        res.sendStatus(403)
        return
      }

      res.sendStatus(200)
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
      await this.service.saveImg(userId, img)
      res.sendStatus(200)
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

      if (await this.service.saveCoord(roomId, data)) {
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

      const coordId = req.params.coordId
      //
      // const isMyCoord = await this.chatService.checkRoom(roomId, userId)
      // if (isMyRoom == null) {
      //   res.sendStatus(403)
      //   return
      // }
      //
      // if (await this.service.saveCoord(roomId, data)) {
      //   res.sendStatus(200)
      // } else {
      //   res.sendStatus(400)
      // }
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

      // const coordId = req.params.coordId
      //
      // const isMyRoom = await this.chatService.checkRoom(roomId, userId)
      // if (isMyRoom == null) {
      //   res.sendStatus(403)
      //   return
      // }
      //
      // if (await this.service.saveCoord(roomId, data)) {
      //   res.sendStatus(200)
      // } else {
      //   res.sendStatus(400)
      // }
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
