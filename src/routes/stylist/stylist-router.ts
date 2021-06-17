import express from 'express'
import { query } from 'express-validator'
import { AuthRequire } from '../../config/auth-check'
import StylistController from './stylist-controller'

const router = express.Router()
const controller = new StylistController()

router.get('/', AuthRequire, controller.getList)
router.get('/search', query('type').isString, controller.getSearchList)

export default router
