import { NextFunction, Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import ResourceService from './resource-service'

export default class ResourceController {
  service = new ResourceService()

  getProfileImg = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const result = await this.service.getProfileImg(id)

    if (result == null) {
      res.sendStatus(404)
    } else {
      res.contentType(result.contentType)
      res.end(result.data)
    }
  }

  getBannerImg = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const result = await this.service.getBannerImg(id)

    if (result == null) {
      res.sendStatus(404)
    } else {
      res.contentType(result.contentType)
      res.end(result.data)
    }
  }
}
