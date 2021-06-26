import { Request, Response } from 'express'
import ProfileService from './profile-service'

export default class ProfileController {
  service = new ProfileService()

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req['auth']

    switch (userType) {
      case 'S':
        res.status(200).send(await this.service.getMyProfileSupplier(userId))
        break
      case 'D':
        res.status(200).send(await this.service.getMyProfileDemander(userId))
        break
      default:
        res.sendStatus(200)
        return
    }
  }

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

  getLookbook = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as any
    const { page } = req.query as any

    const result = await this.service.getLookbook(id, page == null ? 0 : page)
    res.status(200).send(result)
  }

  postProfileImg = async (req: Request, res: Response): Promise<void> => {
    const { key } = req['file']
    const { userId } = req['auth']

    await this.service.postProfileImg(userId, key)
    res.sendStatus(200)
  }
  postLookbook = async (req: Request, res: Response): Promise<void> => {
    const { key } = req['file']
    const { userId } = req['auth']
    const { represent } = req.body

    await this.service.postLookbook(userId, key, represent)
    res.sendStatus(200)
  }

  postCloset = async (req: Request, res: Response): Promise<void> => {
    const { key } = req['file']
    const { userId } = req['auth']

    await this.service.postCloset(userId, key)
    res.sendStatus(200)
  }
}
