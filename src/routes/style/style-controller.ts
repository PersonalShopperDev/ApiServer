import { Request, Response } from 'express'
import StyleService from './style-service'

export default class StyleController {
  service = new StyleService()

  getStyle = async (req: Request, res: Response) => {
    const { userId, userType } = req['auth']
    let { supplyMale, supplyFemale } = await this.service.getSupplyGender(
      userId,
    )

    if (supplyMale == null) {
      supplyMale = req.query['male']
    }
    if (!(userType == 'S' || userType == 'W')) {
      supplyFemale = req.query['female']
    } else {
    }

    const result = this.service.getStyleTypeList(supplyMale, supplyFemale)
    res.status(200).json(result)
  }

  getStyleImg = (req: Request, res: Response) => {
    let { gender } = req['auth']

    if (gender == null) {
      gender = req.query['gender']
    }

    const result = this.service.getStyleImgList(gender)
    res.status(200).json(result)
  }
}
