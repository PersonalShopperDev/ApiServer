import express from 'express'
import { body } from 'express-validator'
import { AuthRequire } from '../../config/auth-check'
import OnboardController from './onboard-controller'

const router = express.Router()
const controller = new OnboardController()

router.get('/', AuthRequire, controller.getOnboard)
router.get('/{:id}', AuthRequire, controller.getOnboard)

router.put(
  '/',
  body('userType').isIn(['D', 'S']),
  body('gender').isIn(['M', 'F']),
  AuthRequire,
  controller.putOnboard,
)
router.patch('/', AuthRequire, controller.patchOnboard)

export default router
