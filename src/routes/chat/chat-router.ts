import express from 'express'
import HomeController from '../home/home-controller'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import ChatController from './chat-controller'
import { body, query } from 'express-validator'

const router = express.Router()
const controller = new ChatController()

router.get('/', AuthRequire, controller.getChatList)
router.post('/', body('targetId').isInt(), AuthRequire, controller.newChatList)

router.get(
  '/history',
  query('roomId').isInt(),
  AuthRequire,
  controller.getChatHistory,
)

export default router
