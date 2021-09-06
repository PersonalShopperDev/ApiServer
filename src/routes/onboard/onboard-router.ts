import express from 'express'
import { body } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import OnboardController from './onboard-controller'

const router = express.Router()
const controller = new OnboardController()

router.put(
  '/',
  body('userType').isIn(['D', 'S']),
  body('gender').isIn(['M', 'F']),
  AuthRequire,
  controller.putOnboard,
)

router.get('/nickname', controller.randomNickname)

export default router
