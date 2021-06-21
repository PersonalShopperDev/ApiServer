import { Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import ProfileService from './profile-service'
import { isProfileData, ProfileData } from './profile-type'

export default class ProfileController {
  service = new ProfileService()

  getOnBoardData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body
    if (!isProfileData(data)) {
      res.sendStatus(422)
    }

    try {
      await this.service.saveOnBoardData(userId, data)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  putOnBoardData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body
    if (!isProfileData(data)) {
      res.sendStatus(422)
    }

    try {
      await this.service.saveOnBoardData(userId, data)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  patchOnBoardData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body as ProfileData

    try {
      await this.service.updateOnBoardData(userId, data)

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
