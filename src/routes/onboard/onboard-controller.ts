import { Request, Response } from 'express'
import OnboardService from './onboard-service'
import {
  isOnboardData,
  OnboardDemander,
  OnboardDemanderPut,
  OnboardSupplier,
  OnboardSupplierPut,
} from './onboard-type'
import { validationResult } from 'express-validator'
import Data from '../../data/data'

export default class OnboardController {
  service = new OnboardService()

  getOnboard = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']

    const targetId = req.params['id'] == null ? userId : req.params['id']

    if (targetId == null) {
      res.sendStatus(400)
      return
    }

    try {
      const result = await this.service.getOnboardData(targetId)

      if (result == null) res.sendStatus(404)
      else res.status(200).json(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  putOnboard = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }

    const { userId } = req['auth']
    const data = req.body as OnboardDemanderPut | OnboardSupplierPut

    try {
      await this.service.saveOnboardData(userId, data)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  patchOnboard = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body as OnboardDemander | OnboardSupplier

    try {
      await this.service.updateOnBoardData(userId, data)

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getBody = async (req: Request, res: Response): Promise<void> => {
    const { gender } = req.query as any
    try {
      const result = Data.getBodyList(gender)

      res.status(200).json(result)
    } catch (e) {
      console.log(e)
      res.sendStatus(500)
    }
  }
}
