import express from 'express'
import { body } from 'express-validator'
import { AuthCheck } from '../../config/auth-check'
import NoticeController from './notice-controller'

const router = express.Router()
const controller = new NoticeController()

router.get('/', AuthCheck, controller.getNoticeList)
router.get('/:noticeId', AuthCheck, controller.getNotice)

export default router
