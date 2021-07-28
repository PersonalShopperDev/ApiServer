import { Request, Response } from 'express'
import ProfileService from './profile-service'
import { UserManager } from '../auth/auth-model'

export default class ProfileController {
  service = new ProfileService()

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params['id'] as any

    try {
      const userType = await UserManager.getUserType(userId)

      switch (userType) {
        case 'S':
        case 'W':
          res.status(200).send(await this.service.getProfileSupplier(userId))
          break
        case 'D':
          res.status(200).send(await this.service.getProfileDemander(userId))
          break
        default:
          res.sendStatus(204)
          return
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req['auth']
    try {
      switch (userType) {
        case 'S':
        case 'W':
          res.status(200).send(await this.service.getMyProfileSupplier(userId))
          break
        case 'D':
          res.status(200).send(await this.service.getMyProfileDemander(userId))
          break
        default:
          res.sendStatus(204)
          return
      }
    } catch (e) {
      res.sendStatus(500)
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
        case 'W':
          await this.service.patchSupplier(userId, req.body)
          break
        default:
          res.sendStatus(403)
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

    try {
      const result = await this.service.getLookbook(id, page == null ? 0 : page)
      res.status(200).send(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getReview = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as any
    const { page } = req.query as any

    try {
      const result = await this.service.getSupplierReview(
        id,
        page == null ? 0 : page,
      )
      res.status(200).send(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  postProfileImg = async (req: Request, res: Response): Promise<void> => {
    const { key } = req['file']
    const { userId } = req['auth']
    try {
      await this.service.postProfileImg(
        userId,
        key.substring(key.lastIndexOf('/') + 1),
      )
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  postLookbook = async (req: Request, res: Response): Promise<void> => {
    const { key } = req['file']
    const { userId } = req['auth']
    const { represent } = req.body
    try {
      await this.service.postLookbook(
        userId,
        key.substring(key.lastIndexOf('/') + 1),
        represent,
      )
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  postCloset = async (req: Request, res: Response): Promise<void> => {
    const { key } = req['file']
    const { userId } = req['auth']

    try {
      await this.service.postCloset(
        userId,
        key.substring(key.lastIndexOf('/') + 1),
      )
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
