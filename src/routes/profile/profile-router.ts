import express from 'express'
import { body } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import ProfileController from './profile-controller'
import S3 from '../../config/s3'
import DIContainer from '../../config/inversify.config'

const router = express.Router()
const controller = DIContainer.get(ProfileController)

router.get('/', AuthRequire, controller.getMyProfile)
router.patch('/', AuthRequire, controller.patchMyProfile)

router.get('/:id', controller.getProfile)
router.get('/:id/lookbook', controller.getLookbook)
router.get('/:id/review', controller.getReview)

const s3 = new S3()

router.post(
  '/img',
  AuthRequire,
  s3.uploadProfile.single('img'),
  controller.postProfileImg,
)
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
