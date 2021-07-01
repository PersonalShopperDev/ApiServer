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
      img: this.getImgUrl(img),
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
      img: this.getImgUrl(img),
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
      img: this.getImgUrl(img),
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
      img: this.getImgUrl(img),
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
    const oldData = { ...baseData, ...baseData.profile }
    const {
      name,
      introduction,
      hopeToSupplier,
      bodyStat,
    } = this.dataOverlap(oldData, data, ['hopeToSupplier', 'bodyStat'])

    const profile = { hopeToSupplier, bodyStat }

    await this.model.saveProfile(
      userId,
      name,
      introduction,
      JSON.stringify({ profile }),
    )
  }

  patchSupplier = async (
    userId: number,
    data: ProfileUser & ProfileSupplierPatch,
  ) => {
    const baseData = await this.model.getBasicProfile(userId)
    const { name, introduction, careerList, price } = this.dataOverlap(
      { ...baseData, ...baseData.profile },
      data,
      ['careerList', 'price'],
    )

    await this.model.saveProfile(
      userId,
      name,
      introduction,
      JSON.stringify({ careerList }),
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

  private getImgUrl = (img: string | undefined): string => {
    return (
      `${process.env.DOMAIN}v1/resource/profile/` +
      (img != null ? img : 'default')
    )
  }

  private dataOverlap = (
    baseData: any,
    newData: any,
    keyList: string[],
  ): any => {
    const result = {}

    keyList.push('name')
    keyList.push('introduction')

    for (const k of keyList) {
      if (newData[k] != null) result[k] = newData[k]
      else result[k] = baseData[k]
    }

    return result
  }
}
