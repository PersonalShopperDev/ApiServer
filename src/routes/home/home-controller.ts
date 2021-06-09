import { Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import HomeService from './home-service'

export default class HomeController {
  service = new HomeService()

  getHomeData = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getHomeData()

    if (result == null) {
      res.sendStatus(400)
    } else {
      res.status(200).json(result)
    }
  }
}
