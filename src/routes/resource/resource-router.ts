import express from 'express'
import ResourceController from './resource-controller'

const router = express.Router()

const controller = new ResourceController()

router.get('/user/profile/:id', controller.getProfileImg)

export default router
