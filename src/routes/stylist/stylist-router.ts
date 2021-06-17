import express from 'express'
import { query } from 'express-validator'
import AuthCheck from '../../config/auth-check'
import StylistController from './stylist-controller'
import AuthService from '../auth/auth-service'

const router = express.Router()
const controller = new StylistController()

router.get('/', AuthCheck, controller.getList)
router.get(
  '/search',
  AuthCheck,
  query('type').isString,
  controller.getSearchList,
)

export default router
