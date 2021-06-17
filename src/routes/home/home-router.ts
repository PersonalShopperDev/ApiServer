import express from 'express'
import { body } from 'express-validator'
import { AuthCheck } from '../../config/auth-check'
import HomeController from './home-controller'

const router = express.Router()
const controller = new HomeController()

router.get('/', AuthCheck, controller.getHomeData)

export default router
