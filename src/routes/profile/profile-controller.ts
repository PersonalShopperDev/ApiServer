import { Request, Response } from 'express'
import ProfileService from './profile-service'
import { UserManager } from '../auth/auth-model'
import { injectable } from 'inversify'
import DIContainer from '../../config/inversify.config'
import {
  ForbiddenError,
  NoContentError,
  NotFoundError,
} from '../../config/Error'
import Data from '../../data/data'

@injectable()
export default class ProfileController {
  service = DIContainer.get(ProfileService)
  userManager = new UserManager()

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as any
      const result = await this.service.getProfile(id)

      res.status(200).send(result)
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.sendStatus(404)
      } else {
        res.sendStatus(500)
      }
    }
  }

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, userType } = req['auth']
      const result = await this.service.getMyProfile(userId, userType)

      res.status(200).send(result)
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.sendStatus(401)
      } else if (e instanceof NoContentError) {
        res.sendStatus(204)
      } else {
        console.log(e)
        res.sendStatus(500)
      }
    }
  }

  patchMyProfile = async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req['auth']

    try {
      await this.service.saveProfile(userId, userType, req.body)

      res.sendStatus(200)
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.sendStatus(401)
      } else if (e instanceof NoContentError) {
        res.sendStatus(204)
      } else {
        console.log(e)
        res.sendStatus(500)
      }
    }
  }

  getCloset = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as any
    const { userId } = req['auth']
    const { page } = req.query as any

    try {
      const result = await this.service.getCloset(
        id ?? userId,
        page == null ? 0 : page,
      )
      res.status(200).send(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getLookbook = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as any
    const { userId } = req['auth']
    const { page } = req.query as any

    try {
      const result = await this.service.getLookbook(
        id ?? userId,
        page == null ? 0 : page,
      )
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
  deleteProfileImg = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']

    try {
      await this.service.deleteProfileImg(userId)
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

  deleteLookbook = async (req: Request, res: Response): Promise<void> => {
    const { lookbookId } = req.params as any
    const { userId } = req['auth']

    try {
      await this.service.deleteLookbook(lookbookId, userId)
      res.sendStatus(200)
    } catch (e) {
      if (e instanceof ForbiddenError) {
        res.sendStatus(403)
      } else {
        res.sendStatus(500)
      }
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

  deleteCloset = async (req: Request, res: Response): Promise<void> => {
    const { closetId } = req.params as any
    const { userId } = req['auth']

    try {
      await this.service.deleteCloset(closetId, userId)
      res.sendStatus(200)
    } catch (e) {
      if (e instanceof ForbiddenError) {
        res.sendStatus(403)
      } else {
        res.sendStatus(500)
      }
    }
  }

  getBody = async (req: Request, res: Response): Promise<void> => {
    const { gender } = req.query as any
    try {
      const result = Data.getBodyList(gender)

      res.status(200).json(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
