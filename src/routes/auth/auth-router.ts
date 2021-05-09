import express from 'express'
import { resources } from './auth-service'
import { body } from 'express-validator'
import AuthCheck from '../../config/auth-check'
import AuthController from './auth-controller'

const router = express.Router()
const authController = new AuthController()

router.post(
  '/login',
  body('resource').isIn(resources),
  body('token').isString(),
  authController.login,
)

router.post('/token', body('refreshToken').isString(), authController.getToken)

router.get('/test', AuthCheck, authController.test)

export default router
