import express from 'express'
import HomeController from '../home/home-controller'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import ChatController from './chat-controller'

const router = express.Router()
const controller = new ChatController()

router.get('/', AuthRequire, controller.getChatList)

export default router
1
