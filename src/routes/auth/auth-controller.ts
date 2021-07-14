import { Request, Response } from 'express'
import AuthService from './auth-service'
import { validationResult } from 'express-validator'

export default class AuthController {
  service = new AuthService()

  login = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }
    try {
      const { resource, token } = req.body

      const result = await this.service.login(resource, token)

      if (result) {
        res.status(200).send(result)
      } else {
        res.sendStatus(400)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getToken = async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(422)
    }
    try {
      const { refreshToken } = req.body

      const result = await this.service.newTokenWithRefreshToken(refreshToken)

      if (result) {
        res.status(200).send(result)
      } else {
        res.sendStatus(400)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  test = (req: Request, res: Response) => {
    res.sendStatus(200)
  }

  withdraw = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }
    try {
      const { userId } = req['auth']
      const result = await this.service.withdraw(userId)

      if (result) {
        res.sendStatus(200)
      } else {
        res.sendStatus(400)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getAgreement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const result = await this.service.getAgreement(userId)

      res.status(200).send(result)
    } catch (e) {
      console.log(e)
      res.sendStatus(500)
    }
  }
  setAgreement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const { terms, privacy } = req.body
      await this.service.setAgreement(userId, terms, privacy)

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
