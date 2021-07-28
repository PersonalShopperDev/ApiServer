import { Request, Response } from 'express'
import EstimateService from './estimate-service'
import { validationResult } from 'express-validator'
import ChatSocket from '../chat/chat-socket'

export default class EstimateController {
  service = new EstimateService()

  getList = async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req['auth']
    const { page } = req.query as any

    try {
      const result = await this.service.getList(userId, page ?? 0)

      if (!result) {
        res.sendStatus(400)
        return
      }
      res.status(200).json(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

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

  setPayment = async (req: Request, res: Response): Promise<void> => {
    const { isAdmin } = req['auth']

    if (!isAdmin) {
      res.sendStatus(401)
      return
    }

    try {
      const { estimateId } = req.params as any

      if (await this.service.setPayment(estimateId)) {
        res.sendStatus(200)
        return
      }
      res.sendStatus(400)
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
