import ProfileModel from './profile-model'
import {
  ProfileDemanderPatch,
  ProfileSupplierPatch,
  ProfileUser,
} from './profile-type'
import { Request, Response } from 'express'

export default class ProfileService {
  model = new ProfileModel()

  getMyProfileStylist = async () => {}
  getMyProfileUser = async () => {}

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
