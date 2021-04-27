import express, { NextFunction, Request, Response } from 'express'
import {
  getTokenWithThirdParty,
  newTokenWithRefreshToken,
  resources,
} from '../service/AuthService'
import DIContainer from '../config/inversify.config'
import AuthCheck from '../config/AuthCheck'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.post(
  '/login',
  body('resource').isIn(resources),
  body('code').isString(),
  async (req: Request, res: Response) => {
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
  },
)

router.post(
  '/token',
  body('refreshToken').isString(),
  (req: Request, res: Response) => {
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
  },
)

router.get('/test', AuthCheck, (req: Request, res: Response) => {
  res.sendStatus(200)
})

export default router
