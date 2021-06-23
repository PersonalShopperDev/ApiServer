import { Request, Response } from 'express'
import DIContainer from '../../config/inversify.config'
import ProfileService from './profile-service'
import { isOnBoardingData, OnBoardingData } from './profile-type'
import { getStyleImgList, getStyleTypeList } from '../../data/style'

export default class ProfileController {
  service = new ProfileService()

  getOnBoardData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']

    const targetId = req.params['id']
    console.log(targetId)

    const result = await this.service.getOnBoardData(
      targetId == null ? userId : targetId,
      userId,
    )

    if (result == null) res.sendStatus(404)
    else res.status(200).json(result)
  }

  putOnBoardData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body
    if (!isOnBoardingData(data)) {
      res.sendStatus(422)
    }

    try {
      await this.service.saveOnBoardData(userId, data)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  patchOnBoardData = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const data = req.body as OnBoardingData

    try {
      await this.service.updateOnBoardData(userId, data)

      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }

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

    const result = getStyleTypeList(supplyMale, supplyFemale)
    res.status(200).json(result)
  }

  getStyleImg = (req: Request, res: Response) => {
    let { gender } = req['auth']

    if (gender == null) {
      gender = req.query['gender']
    }

    const result = getStyleImgList(gender)
    res.status(200).json(result)
  }

  // getMyProfile = async (req: Request, res: Response): Promise<void> => {
  //   const { userId, userType } = req['auth']
  //
  //   switch (userType) {
  //     case 'S':
  //       await this.service.updateOnBoardData(userId)
  //       break
  //     case 'D':
  //       break
  //     default:
  //       res.sendStatus(200)
  //       return
  //   }
  // }

  patchMyProfile = async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req['auth']

    console.log(userId + ' ' + userType)

    try {
      switch (userType) {
        case 'D':
          await this.service.patchProfileUser(userId, req.body)
          break
        case 'S':
          await this.service.patchProfileStylist(userId, req.body)
          break
        default:
          res.sendStatus(400)
          return
      }

      res.sendStatus(200)
    } catch (e) {
      console.log(e)
      res.sendStatus(500)
    }
  }
}
