import ProfileModel from './profile-model'
import StyleModel from '../style/style-model'
import {
  ProfileDemanderGet,
  ProfileDemanderPatch,
  ProfileSupplierGet,
  ProfileSupplierPatch,
  ProfileUser,
} from './profile-type'

export default class ProfileService {
  model = new ProfileModel()

  getProfileSupplier = async (userId: number): Promise<ProfileSupplierGet> => {
    const {
      name,
      introduction,
      img,
      profile,
    } = await this.model.getBasicProfile(userId)
    const styles = await StyleModel.getUserStyleOnlyValue(userId)

    const price = await this.model.getPrice(userId)
    const coord = await this.model.getCoordList(userId)
    const {
      rating,
      reviewCount,
      hireCount,
    } = await this.model.getSupplierPoint(userId)

    return {
      userType: 'S',
      name,
      introduction,
      img,
      ...profile,
      styles,
      price,
      coord,
      reviewCount,
      hireCount,
      rating,
    } as ProfileSupplierGet
  }

  getProfileDemander = async (userId: number): Promise<ProfileDemanderGet> => {
    const baseData = await this.model.getBasicProfile(userId)
    const { name, introduction, img, onboard } = baseData
    let { profile } = baseData
    const styles = await StyleModel.getUserStyleOnlyValue(userId)
    const closetList = await this.model.getClosetList(userId)

    const additionalBodyStat = { body: onboard['body'] }
    if (profile == null) {
      profile = { bodyStat: additionalBodyStat }
    } else if (profile['bodyStat'] == null) {
      profile['bodyStat'] = additionalBodyStat
    } else if (profile.bodyStat.public != true) {
      profile['bodyStat'] = additionalBodyStat
    } else {
      profile['bodyStat'].push(additionalBodyStat)
    }

    return {
      userType: 'D',
      name,
      introduction,
      img,
      ...profile,
      styles,
      closet: closetList,
    } as ProfileDemanderGet
  }

  getMyProfileSupplier = async (
    userId: number,
  ): Promise<ProfileSupplierGet> => {
    const {
      name,
      introduction,
      img,
      profile,
    } = await this.model.getBasicProfile(userId)
    const styles = await StyleModel.getUserStyleOnlyValue(userId)

    const price = await this.model.getPrice(userId)
    const coord = await this.model.getCoordList(userId)

    return {
      userType: 'S',
      name,
      introduction,
      img,
      ...profile,
      styles,
      price,
      coord,
    } as ProfileSupplierGet
  }

  getMyProfileDemander = async (
    userId: number,
  ): Promise<ProfileDemanderGet> => {
    const {
      name,
      introduction,
      img,
      profile,
    } = await this.model.getBasicProfile(userId)
    const styles = await StyleModel.getUserStyleOnlyValue(userId)

    const closetList = await this.model.getClosetList(userId)

    return {
      userType: 'D',
      name,
      introduction,
      img,
      ...profile,
      styles,
      closet: closetList,
    } as ProfileDemanderGet
  }

  patchDemander = async (
    userId: number,
    data: ProfileUser & ProfileDemanderPatch,
  ) => {
    const baseData = await this.model.getBasicProfile(userId)
    let { name, introduction } = baseData
    const { profile } = baseData
    const { hopeToSupplier, bodyStat } = data

    // DB에 있는 정보로 일단 생성
    const patchData = {
      ...profile,
      hopeToSupplier,
      bodyStat,
    } as ProfileDemanderPatch

    if (data.name != null) {
      name = data.name
    }

    if (data.introduction != null) {
      introduction = data.introduction
    }
    if (hopeToSupplier != null) {
      patchData.hopeToSupplier = hopeToSupplier
    }
    if (bodyStat == null) {
      patchData.bodyStat = bodyStat
    }

    await this.model.saveProfile(
      userId,
      name,
      introduction,
      JSON.stringify(patchData),
    )
  }

  patchSupplier = async (
    userId: number,
    data: ProfileUser & ProfileSupplierPatch,
  ) => {
    const baseData = await this.model.getBasicProfile(userId)
    let { name, introduction } = baseData
    const { profile } = baseData
    const { careerList, price } = data

    // DB에 있는 정보로 일단 생성
    const patchData = {
      ...profile,
      careerList,
      price,
    } as ProfileSupplierPatch

    if (data.name != null) {
      name = data.name
    }

    if (data.introduction != null) {
      introduction = data.introduction
    }

    if (careerList != null) {
      patchData.careerList = careerList
    }

    if (price != null) {
      patchData.price = price
    }

    await this.model.saveProfile(
      userId,
      name,
      introduction,
      JSON.stringify(patchData),
    )

    if (price != null) {
      await this.model.updateSupplierData(userId, price)
    }
  }

  getLookbook = async (userId: number, page: number): Promise<{ list }> => {
    return {
      list: await this.model.getLookbookList(userId, page),
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
