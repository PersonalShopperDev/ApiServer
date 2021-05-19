import {NextFunction, Request, Response} from 'express'
import AuthService from './auth-service'
import {validationResult} from 'express-validator'

export default class AuthController {
  login = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }
    const {resource, token} = req.body

    const service = new AuthService()
    const result = await service.login(resource, token)

    if (result) {
      res.status(200).send(result)
    } else {
      res.sendStatus(400)
    }
  }

  getToken = async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(422)
    }

    const {refreshToken} = req.body

    const service = new AuthService()
    const result = await service.newTokenWithRefreshToken(refreshToken)

    if (result) {
      res.status(200).send(result)
    } else {
      res.sendStatus(400)
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

    const {userId} = req['auth']
    const service = new AuthService()
    const result = await service.withdraw(userId)

    if (result) {
      res.sendStatus(200)
    } else {
      res.sendStatus(400)
    }
  }
}
