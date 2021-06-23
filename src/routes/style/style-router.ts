import express from 'express'
import { body } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import StyleController from './style-controller'

const router = express.Router()
const controller = new StyleController()

router.get('/', AuthCheck, controller.getStyle)
router.get('/img', AuthCheck, controller.getStyleImg)

export default router
