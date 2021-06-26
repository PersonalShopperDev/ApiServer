import ProfileModel from './profile-model'
import StyleModel from '../style/style-model'
import {
  ProfileDemanderGet,
  ProfileDemanderPatch,
  ProfileSupplierGet,
  ProfileSupplierPatch,
  ProfileUser,
} from './profile-type'
import { Request, Response } from 'express'

export default class ProfileService {
  model = new ProfileModel()

  getMyProfileSupplier = async (
    userId: number,
  ): Promise<ProfileSupplierGet> => {
    const basic = await this.model.getBasicProfile(userId)
    const styles = (await StyleModel.getUserStyle(userId)).map(
      (item) => item.value,
    )

    const price = await this.model.getPrice(userId)
    const coord = await this.model.getCoordList(userId, true)

    return {
      userType: 'S',
      ...basic,
      styles,
      price,
      coord,
    } as ProfileSupplierGet
  }

  getMyProfileDemander = async (
    userId: number,
  ): Promise<ProfileDemanderGet> => {
    const basic = await this.model.getBasicProfile(userId)
    const styles = (await StyleModel.getUserStyle(userId)).map(
      (item) => item.value,
    )

    const closetList = await this.model.getClosetList(userId)

    return {
      userType: 'D',
      ...basic,
      styles,
      closet: closetList,
    } as ProfileDemanderGet
  }

  patchDemander = async (
    userId: number,
    data: ProfileUser & ProfileDemanderPatch,
  ) => {
    const baseData = this.model.getBasicProfile(userId)
    const { hopeToSupplier, bodyStat } = data
    let patchData = {} as ProfileDemanderPatch

    if (baseData == null) {
      patchData = { hopeToSupplier, bodyStat }
    } else {
      if (hopeToSupplier != null) {
        patchData['hopeToStylist'] = hopeToSupplier
      }
      if (bodyStat == null) {
        patchData['bodyStat'] = bodyStat
      }
    }

    await this.model.saveProfile(
      userId,
      data['name'],
      data['introduction'],
      JSON.stringify(patchData),
    )
  }

  patchSupplier = async (
    userId: number,
    data: ProfileUser & ProfileSupplierPatch,
  ) => {
    let { profile }: any = this.model.getBasicProfile(userId)
    const { careerList, price } = data

    if (profile == null) {
      profile = { careerList }
    } else {
      if (careerList != null) {
        profile['careerList'] = careerList
      }
    }
    await this.model.saveProfile(
      userId,
      data['name'],
      data['introduction'],
      JSON.stringify(profile),
    )

    if (price != null) {
      await this.model.updateStylistData(userId, price)
    }
  }

  postProfileImg = async (userId: number, path: string): Promise<number> => {
    return await this.model.postProfileImg(userId, path)
  }
  postLookbook = async (
    userId: number,
    path: string,
    represent: boolean,
  ): Promise<number> => {
    return await this.model.postLookbook(userId, path, represent)
  }
  postCloset = async (userId: number, path: string): Promise<number> => {
    return await this.model.postCloset(userId, path)
  }
}
