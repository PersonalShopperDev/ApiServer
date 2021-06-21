import { Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import ProfileService from './profile-service'
import { isProfileData, ProfileData } from './profile-type'

export default class ProfileController {
  service = new ProfileService()

  putProfileData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body
    if (!isProfileData(data)) {
      res.sendStatus(422)
    }

    try {
      await this.service.saveProfileData(userId, data)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  patchProfileData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body as ProfileData

    try {
      await this.service.updateProfileData(userId, data)

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
