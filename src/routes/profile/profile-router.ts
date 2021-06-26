import express from 'express'
import { body } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import ProfileController from './profile-controller'
import S3 from '../../config/s3'

const router = express.Router()
const controller = new ProfileController()

// router.get('/', AuthRequire, controller.getMyProfile)
router.patch('/', AuthRequire, controller.patchMyProfile)

const s3 = new S3()

router.post(
  '/lookbook',
  AuthRequire,
  s3.uploadLookbook.single('img'),
  controller.postLookbook,
)
router.post(
  '/closet',
  AuthRequire,
  s3.uploadCloset.single('img'),
  controller.postCloset,
)

export default router
