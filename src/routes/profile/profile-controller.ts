import { Request, Response } from 'express'
import ProfileService from './profile-service'

export default class ProfileController {
  service = new ProfileService()

  // getMyProfile = async (req: Request, res: Response): Promise<void> => {
  //   const { userId, userType } = req['auth']
  //
  //   switch (userType) {
  //     case 'S':
  //       await this.service.updateOnBoardData(userId)
  //       break
  //     case 'D':
  //       break
  //     default:
  //       res.sendStatus(200)
  //       return
  //   }
  // }

  patchMyProfile = async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req['auth']

    try {
      switch (userType) {
        case 'D':
          await this.service.patchDemander(userId, req.body)
          break
        case 'S':
          await this.service.patchSupplier(userId, req.body)
          break
        default:
          res.sendStatus(400)
          return
      }

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
