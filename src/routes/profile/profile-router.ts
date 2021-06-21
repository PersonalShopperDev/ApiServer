import express from 'express'
import { body } from 'express-validator'
import { AuthRequire } from '../../config/auth-check'
import ProfileController from './profile-controller'

const router = express.Router()
const controller = new ProfileController()

router.put('/', AuthRequire, controller.putProfileData)
router.patch('/', AuthRequire, controller.patchProfileData)

export default router
