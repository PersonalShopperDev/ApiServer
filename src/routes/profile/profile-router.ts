import express from 'express'
import { body } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import ProfileController from './profile-controller'

const router = express.Router()
const controller = new ProfileController()

router.get('/style', AuthCheck, controller.getStyle)
router.get('/style/img', AuthCheck, controller.getStyleImg)

router.put('/data/demander', AuthRequire, controller.putOnBoardData)
router.put('/data/supplier', AuthRequire, controller.putOnBoardData)

router.get('/data', AuthRequire, controller.getOnBoardData)
router.patch('/data', AuthRequire, controller.patchOnBoardData)
router.get('/data/:id', AuthRequire, controller.getOnBoardData)

// router.get('/', AuthRequire, controller.getMyProfile)
router.patch('/', AuthRequire, controller.patchMyProfile)

export default router
