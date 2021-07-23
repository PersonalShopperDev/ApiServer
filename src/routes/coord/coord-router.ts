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
  upload.single('mainImg'),
  body('demanderId').isInt(),
  body('title').isString().isLength({ max: 50 }),
  body('comment').isString().isLength({ max: 700 }),
  AuthRequire,
  controller.newCoord,
)

router.post(
  '/cloth',
  upload.single('img'),
  body('coordId').isInt(),
  body('name').isString().isLength({ max: 50 }),
  // body('price').isInt(),
  // body('purchaseUrl').isString().isLength({ max: 150 }),
  AuthRequire,
  controller.addCloth,
)

export default router
