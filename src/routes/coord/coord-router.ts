import express from 'express'
import { body, query } from 'express-validator'
import { AuthRequire } from '../../config/auth-check'
import CoordController from './coord-controller'
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

router.post('/img', upload.single('img'), AuthRequire, controller.saveImg)
router.post(
  '/',
  body('roomId').isInt(),
  body('comment').isString(),
  body('clothes').isArray(),
  body('clothes.*.price').isInt(),
  body('clothes.*.purchaseUrl').isString(),
  body('clothes.*.mainImg').isString(),
  AuthRequire,
  controller.saveCoord,
)

router.post('/:coordId/edit', AuthRequire, controller.requestEditCoord)
router.post('/:coordId/confirm', AuthRequire, controller.confirmCoord)

export default router
