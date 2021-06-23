import { Request, Response } from 'express'
import OnboardService from './onboard-service'
import { isOnboardData, OnboardDemander, OnboardSupplier } from './onboard-type'

export default class OnboardController {
  service = new OnboardService()

  getOnboard = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']

    const targetId = req.params['id']

    const result = await this.service.getOnboardData(
      targetId == null ? userId : targetId,
    )

    if (result == null) res.sendStatus(404)
    else res.status(200).json(result)
  }

  putOnboard = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    if (!isOnboardData(req.body)) {
      res.sendStatus(422)
    }
    const data = req.body as OnboardDemander | OnboardSupplier

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
}
