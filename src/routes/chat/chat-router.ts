import express from 'express'
import HomeController from '../home/home-controller'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import ChatController from './chat-controller'
import { body, query } from 'express-validator'
import multer from 'multer'

const router = express.Router()
const controller = new ChatController()

const upload = multer()

router.get('/', AuthRequire, controller.getChatList)
router.post('/', body('targetId').isInt(), AuthRequire, controller.newChatList)

router.get('/:roomId', AuthRequire, controller.getChatHistory)
router.post(
  '/:roomId/img',
  AuthRequire,
  upload.single('img'),
  controller.postImg,
)

export default router
