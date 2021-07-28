import { Request, Response } from 'express'
import ReviewService from './review-service'
import { validationResult } from 'express-validator'

export default class ReviewController {
  service = new ReviewService()

  saveReview = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }

    const { userId } = req['auth']

    const { estimateId } = req.params as any
    const coordId = await this.service.getCoordId(userId, estimateId)
    try {
      if (coordId == null) {
        res.sendStatus(404)
        return
      }

      await this.service.saveReview(estimateId, coordId, req.body)

      const { beforeImg, afterImg } = req['files']

      if (beforeImg != null)
        await this.service.saveBeforeImage(userId, coordId, beforeImg)
      if (afterImg != null)
        await this.service.saveAfterImage(userId, coordId, afterImg)

      res.sendStatus(200)
    } catch (e) {
      if (e.message === 'DUP_REVIEW') res.sendStatus(409)
      else res.sendStatus(500)
    }
  }

  getCoordInfo = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']

    const { estimateId } = req.params as any
    const coordId = await this.service.getCoordId(userId, estimateId)
    try {
      if (coordId == null) {
        res.sendStatus(404)
        return
      }

      const result = await this.service.getCoordInfo(coordId)

      res.status(200).json(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
