import { Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import ResourceModel from './resource-model'

export default class ResourceController {
  model = DIContainer.resolve(ResourceModel)

  get = async (req: Request, res: Response): Promise<void> => {
    const { path, id } = req.params

    const result = await this.model.getResourceFromS3(`${path}/${id}`)

    if (result == null) {
      res.sendStatus(404)
    } else {
      res.contentType(result.contentType)
      res.end(result.data)
    }
  }
}
