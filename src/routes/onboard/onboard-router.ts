import express from 'express'
import { body } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import OnboardController from './onboard-controller'

const router = express.Router()
const controller = new OnboardController()

router.get('/', AuthRequire, controller.getOnboard)
router.get('/{:id}', AuthRequire, controller.getOnboard)

router.put('/', AuthRequire, controller.putOnboard)
router.patch('/', AuthRequire, controller.putOnboard)

export default router
