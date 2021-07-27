import express from 'express'
import { AuthRequire } from '../../config/auth-check'
import EstimateController from './estimate-controller'
import { body } from 'express-validator'

const router = express.Router()
const controller = new EstimateController()

router.put(
  '/:estimateId/payer',
  body('name').isString(),
  AuthRequire,
  controller.setPayer,
)

router.put(
  '/:estimateId/confirm',
  body('estimateId').isInt(),
  body('name').isString(),
  AuthRequire,
  controller.setPayer,
)

router.put(
  '/:estimateId/payer',
  body('estimateId').isInt(),
  body('name').isString(),
  AuthRequire,
  controller.setPayer,
)
export default router