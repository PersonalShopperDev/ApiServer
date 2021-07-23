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
    const mainImg = req['file']

    if (!validationResult(req).isEmpty() || mainImg == null) {
      console.log(validationResult(req))
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
      const coordId = await this.service.newCoord(
        demanderId,
        userId,
        title,
        comment,
      )

      if (coordId == null) {
        res.sendStatus(403)
        return
      }

      await this.service.saveMainImg(coordId, mainImg)

      res.status(200).send({ coordId })
    } catch (e) {
      console.log(e)
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

      if (result == null) {
        res.sendStatus(403)
        return
      }

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
