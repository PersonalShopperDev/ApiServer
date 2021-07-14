import express from 'express'
import { body } from 'express-validator'
import { AuthRequire } from '../../config/auth-check'
import AuthController from './auth-controller'
import AuthService from './auth-service'

const router = express.Router()
const authController = new AuthController()

router.post(
  '/login',
  body('resource').isIn(AuthService.resources),
  body('token').isString(),
  authController.login,
)

router.get('/agreement', AuthRequire, authController.getAgreement)
router.put('/agreement', AuthRequire, authController.setAgreement)

router.post('/token', body('refreshToken').isBase64(), authController.getToken)

router.delete('/withdraw', AuthRequire, authController.withdraw)

router.get('/test', AuthRequire, authController.test)

export default router
