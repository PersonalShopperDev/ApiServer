import { Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import HomeService from './home-service'

export default class HomeController {
  service = new HomeService()

  getHomeData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, userType, gender } = req['auth']
      const result = await this.service.getHomeData(userId, gender)

      if (result == null) {
        res.sendStatus(400)
        return
      }

      if (userType == 'S' || userType == 'W') {
        result['demanders'] = await this.service.getDemanderList(userId)
      }
      res.status(200).json(result)
    } catch (e) {
      console.log(e)
      res.sendStatus(500)
    }
  }
}
