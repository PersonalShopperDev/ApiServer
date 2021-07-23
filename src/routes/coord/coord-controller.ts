import { Request, Response } from 'express'
import CoordService from './coord-service'
import { validationResult } from 'express-validator'

export default class CoordController {
  service = new CoordService()

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
    const { mainImg, clothImg } = req['files']

    if (
      !validationResult(req).isEmpty() ||
      mainImg == null ||
      clothImg == null
    ) {
      res.sendStatus(422)
      return
    }

    const { userId, userType } = req['auth']

    if (userType != 'S') {
      res.sendStatus(403)
      return
    }

    const {
      demanderId,
      clothName,
      clothPrice,
      clothPurchaseUrl,
      comment,
    } = req.body

    try {
      const coordId = await this.service.newCoord(demanderId, userId, comment)

      if (coordId == null) {
        res.sendStatus(403)
        return
      }

      await this.service.saveMainImg(coordId, mainImg[0])
      await this.service.saveClothImg(
        coordId,
        clothImg,
        clothName,
        clothPrice,
        clothPurchaseUrl,
      )

      res.status(200).send({ coordId })
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
