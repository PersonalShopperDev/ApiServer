import express from 'express'
import { body } from 'express-validator'
import { AuthRequire } from '../../config/auth-check'
import ProfileController from './profile-controller'

const router = express.Router()
const controller = new ProfileController()

router.get('/data', AuthRequire, controller.getOnBoardData)
router.put('/data', AuthRequire, controller.putOnBoardData)
router.patch('/data', AuthRequire, controller.patchOnBoardData)
router.get('/data/:id', AuthRequire, controller.getOnBoardData)

export default router
