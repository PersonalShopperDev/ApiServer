import express from 'express'
import ResourceController from './resource-controller'

const router = express.Router()

const controller = new ResourceController()

router.get('/user/profile/:id', controller.getProfileImg)
router.get('/banner/:id', controller.getBannerImg)

export default router
