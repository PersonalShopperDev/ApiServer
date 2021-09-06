import { Request, Response } from 'express'
import OnboardService from './onboard-service'
import { validationResult } from 'express-validator'
import { OnboardData } from './onboard-type'
import DIContainer from '../../config/inversify.config'
import ProfileService from '../profile/profile-service'

export default class OnboardController {
  service = new OnboardService()
  profileService = DIContainer.get(ProfileService)

  putOnboard = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }

    try {
      const { userId } = req['auth']
      const data = req.body as OnboardData

      await this.service.createUser(userId, data)

      await this.profileService.saveProfile(userId, data.userType, data)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  randomNickname = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getRandomNickname()
      res.status(200).send(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
