import express from 'express'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import ProfileController from './profile-controller'
import S3 from '../../config/s3'
import DIContainer from '../../config/inversify.config'

const router = express.Router()
const controller = DIContainer.get(ProfileController)

router.get('/', AuthRequire, controller.getMyProfile)
router.patch('/', AuthRequire, controller.patchMyProfile)
router.get('/closet', AuthRequire, controller.getCloset)
router.get('/lookbook', AuthRequire, controller.getLookbook)
router.get('/body', controller.getBody)

router.delete('/lookbook/:lookbookId', AuthRequire, controller.deleteLookbook)
router.delete('/closet/:closetId', AuthRequire, controller.deleteCloset)

const s3 = new S3()

router.post(
  '/img',
  AuthRequire,
  s3.uploadProfile.single('img'),
  controller.postProfileImg,
)
router.delete('/img', AuthRequire, controller.postProfileImg)

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

router.get('/:id', controller.getProfile)
router.get('/:id/closet', AuthCheck, controller.getCloset)
router.get('/:id/lookbook', AuthCheck, controller.getLookbook)
router.get('/:id/review', AuthCheck, controller.getReview)

export default router
