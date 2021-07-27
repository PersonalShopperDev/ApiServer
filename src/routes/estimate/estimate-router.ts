import express from 'express'
import { AuthAdmin, AuthRequire } from '../../config/auth-check'
import EstimateController from './estimate-controller'
import { body } from 'express-validator'

const router = express.Router()
const controller = new EstimateController()

router.get('/', AuthRequire, controller.getList)

router.put(
  '/:estimateId/payer',
  body('name').isString(),
  AuthRequire,
  controller.setPayer,
)

router.put(
  '/:estimateId/payment',
  body('estimateId').isInt(),
  body('name').isString(),
  AuthAdmin,
  controller.setPayment,
)

router.put(
  '/:estimateId/confirm',
  body('estimateId').isInt(),
  body('name').isString(),
  AuthRequire,
  controller.confirmEstimate,
)
export default router
