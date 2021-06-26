import express from 'express'
import ResourceController from './resource-controller'

const router = express.Router()

const controller = new ResourceController()

router.get('/:path/:id', controller.get)

export default router
