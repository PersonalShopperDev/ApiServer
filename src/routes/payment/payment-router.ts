import express from 'express'
import { AuthAdmin, AuthRequire } from '../../config/auth-check'
import PaymentController from './payment-controller'
import { body } from 'express-validator'

const router = express.Router()
const controller = new PaymentController()

router.post('/:roomId/request', AuthRequire, controller.request)
router.post(
  '/:roomId/account',
  body('name').isString(),
  AuthRequire,
  controller.completeAccount,
)

export default router
