import express from 'express'
import { body, query } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import CoordController from './coord-controller'
import S3 from '../../config/s3'
import multer from 'multer'

const router = express.Router()
const controller = new CoordController()
const upload = multer()

router.get('/', query('coordId').isInt(), AuthRequire, controller.getCoord)
router.post(
  '/',
  upload.fields([{ name: 'mainImg' }, { name: 'clothImg' }]),
  body('demanderId').isInt(),
  body('title').isString().isLength({ max: 50 }),
  body('comment').isString().isLength({ max: 700 }),
  body('clothName').isArray(),
  body('clothName.*').isString().isLength({ max: 50 }),
  body('clothPrice').isArray(),
  body('clothPrice.*').isString().isLength({ max: 50 }),
  body('clothPurchaseUrl').isArray(),
  body('clothPurchaseUrl.*').isString().isLength({ max: 150 }),
  AuthRequire,
  controller.newCoord,
)

export default router
