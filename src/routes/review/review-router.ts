import express from 'express'
import { AuthRequire } from '../../config/auth-check'
import ReviewController from './review-controller'
import multer from 'multer'
import { body } from 'express-validator'

const router = express.Router()
const controller = new ReviewController()

const upload = multer()

router.put(
  '/:estimateId',
  AuthRequire,
  upload.fields([{ name: 'beforeImg' }, { name: 'afterImg' }]),
  body('rating').isInt({ min: 1, max: 5 }),
  body('content').isString().isLength({ max: 700 }),
  body('publicBody').isBoolean(),
  controller.saveReview,
)

router.get('/:estimateId/coord', AuthRequire, controller.getCoordInfo)

export default router
