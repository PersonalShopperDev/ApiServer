import { Request, Response } from 'express'
import EstimateService from './estimate-service'
import { validationResult } from 'express-validator'

export default class EstimateController {
  service = new EstimateService()

  setPayer = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }

    const { userId, userType } = req['auth']

    if (userType != 'D') {
      res.sendStatus(403)
      return
    }

    try {
      const { estimateId } = req.params as any
      const { name } = req.body
      const result = await this.service.setPayer(userId, estimateId, name)

      if (!result) {
        res.sendStatus(403)
        return
      }

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  confirmEstimate = async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req['auth']

    if (userType != 'D') {
      res.sendStatus(403)
      return
    }

    try {
      const { estimateId } = req.params as any
      const result = await this.service.confirmEstimate(userId, estimateId)

      res.sendStatus(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
