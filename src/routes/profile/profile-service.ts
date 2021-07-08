import ProfileModel from './profile-model'
import StyleModel from '../style/style-model'
import {
  ProfileDemanderGet,
  ProfileDemanderPatch,
  ProfileSupplierGet,
  ProfileSupplierPatch,
  ProfileUser,
  ReviewData,
} from './profile-type'
import ResourcePath from '../resource/resource-path'
import { body } from 'express-validator'
import Data from '../../data/data'

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
      img: ResourcePath.profileImg(img),
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

    const additionalBodyStat = { body: Data.getBodyItem(onboard['body']) }
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
      img: ResourcePath.profileImg(img),
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
      img: ResourcePath.profileImg(img),
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
      img: ResourcePath.profileImg(img),
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
      JSON.stringify(profile),
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

  getReview = async (
    supplierId: number,
    page: number,
  ): Promise<{
    rating: number | undefined
    totalCount: number
    list: ReviewData[]
  }> => {
    const base = await this.model.getReviewList(supplierId, page)
    const { reviewCount, rating } = await this.model.getSupplierPoint(
      supplierId,
    )

    const list: ReviewData[] = []

    for (const index in base) {
      const {
        id,
        name,
        profileImg,
        coordImg,
        content,
        rating,
        publicBody,
        type,
        profile,
        onboard,
        date,
      } = base[index]

      const reviewImg = await this.model.getReviewImg(id)

      const img = [
        ResourcePath.coordImg(coordImg),
        ...reviewImg.map((row) => ResourcePath.reviewImg(row.img)),
      ]

      const year = date.getFullYear()
      const month = ('0' + (1 + date.getMonth())).slice(-2)
      const day = ('0' + date.getDate()).slice(-2)

      const item: ReviewData = {
        id,
        name,
        img,
        rating,
        content,
        profileImg: ResourcePath.profileImg(profileImg),
        date: `${year}-${month}-${day}`,
        body: Data.getBodyItem(onboard['body']),
        styleTypeList: StyleModel.getStyleTypeList(type),
        weight: undefined,
        height: undefined,
      }

      if (publicBody && profile != null && profile['BodyStat'] != null) {
        const { weight, height } = profile['BodyStat']
        if (weight != null) {
          item['weight'] = weight
        }

        if (height != null) {
          item['height'] = height
        }
      }

      list.push(item)
    }

    return { list, rating, totalCount: reviewCount }
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
