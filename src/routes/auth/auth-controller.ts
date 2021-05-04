import { NextFunction, Request, Response } from 'express'
import {
  getTokenWithThirdParty,
  newTokenWithRefreshToken,
  resources,
} from './auth-service'
import DIContainer from '../../config/inversify.config'
import { validationResult } from 'express-validator'

export default class AuthController {
  login = async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(422)
    }
    const { resource, code } = req.body

    const result = await getTokenWithThirdParty(resource, code)

    if (result) {
      res.status(200).send(result)
    } else {
      res.sendStatus(400)
    }
  }

  getToken = (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(422)
    }

    const refreshToken = req.body

    const result = newTokenWithRefreshToken(refreshToken)

    if (result) {
      res.status(200).send(result)
    } else {
      res.sendStatus(400)
    }
  }

  test = (req: Request, res: Response) => {
    res.sendStatus(200)
  }
}
