import { Request, Response } from 'express'
import StyleService from './style-service'
import { validationResult } from 'express-validator'

export default class StyleController {
  service = new StyleService()

  getStyle = async (req: Request, res: Response): Promise<void> => {
    const { userId, gender } = req['auth']

    try {
      const { male, female } = req.query as any
      let supplyMale: boolean | undefined
      let supplyFemale: boolean | undefined

      if (gender == 'M') {
        supplyMale = true
      } else if (gender == 'F') {
        supplyFemale = true
      }

      if (male != null) {
        supplyMale = male
      }
      if (female != null) {
        supplyFemale = female
      }

      if (supplyMale == null && supplyFemale == null) {
        res.sendStatus(400)
        return
      }

      const result = this.service.getStyleTypeList(supplyMale, supplyFemale)
      res.status(200).json(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getStyleSupply = async (req: Request, res: Response): Promise<void> => {
    const { userId, gender } = req['auth']

    try {
      const { supplyMale, supplyFemale } = await this.service.getSupplyGender(
        userId,
      )

      if (supplyMale == null && supplyFemale == null) {
        res.sendStatus(400)
        return
      }

      const result = this.service.getStyleTypeList(supplyMale, supplyFemale)
      res.status(200).json(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  getStyleImg = (req: Request, res: Response): void => {
    let gender = req.query['gender'] as string

    if (gender == null) {
      gender = req['auth'].gender
    }

    if (gender == null) {
      res.sendStatus(400)
      return
    }

    try {
      const result = this.service.getStyleImgList(gender)
      res.status(200).json(result)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  putStyle = async (req: Request, res: Response): Promise<void> => {
    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }

    const { userId } = req['auth']

    const { list } = req.body
    try {
      await this.service.saveStyle(userId, list)

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
