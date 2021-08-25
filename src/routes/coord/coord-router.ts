import express from 'express'
import { body, query } from 'express-validator'
import { AuthRequire } from '../../config/auth-check'
import CoordController from './coord-controller'
import multer from 'multer'

const router = express.Router()
const controller = new CoordController()
const upload = multer()

router.post('/img', upload.single('img'), AuthRequire, controller.saveImg)
router.post(
  '/',
  body('roomId').isInt(),
  body('title').isString().isLength({ max: 50 }),
  body('comment').isString().isLength({ max: 700 }),
  body('clothes').isArray(),
  body('clothes.*.price').isInt(),
  body('clothes.*.purchaseUrl').isString(),
  body('clothes.*.img').isString(),
  AuthRequire,
  controller.saveCoord,
)

router.get('/:coordId', AuthRequire, controller.getCoord)

router.post('/:coordId/edit', AuthRequire, controller.requestEditCoord)
router.post('/:coordId/confirm', AuthRequire, controller.confirmCoord)

export default router
