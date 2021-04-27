import express, { NextFunction, Request, Response } from 'express'
import AuthService from '../service/AuthService'
import AuthCheck from '../config/AuthCheck'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.post(
  '/token',
  '/login',
  body('resource').isIn(AuthService.thirdParty),
  body('code').isString(),
  (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(422)
    }

router.post(
  '/token',
  body('refreshToken').isString(),
  (req: Request, res: Response, next: NextFunction) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(422)
    }
  },
)

router.get(
  '/test',
  AuthCheck,
  (req: Request, res: Response, next: NextFunction) => {
    res.sendStatus(200)
  },
)

export default router
