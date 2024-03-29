import express from 'express'
import { body } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import StyleController from './style-controller'

const router = express.Router()
const controller = new StyleController()

router.get('/', AuthCheck, controller.getStyle)
router.get('/supply', AuthRequire, controller.getStyleSupply)
router.get('/img', AuthCheck, controller.getStyleImg)

router.put('/', body('list').isArray(), AuthRequire, controller.putStyle)
router.put(
  '/img',
  body('list').isArray({ max: 3 }),
  AuthRequire,
  controller.putStyleByImg,
)

export default router
