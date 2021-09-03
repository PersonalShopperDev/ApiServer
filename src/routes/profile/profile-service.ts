import ProfileModel from './profile-model'
import StyleModel from '../style/style-model'
import {
  DemanderProfile,
  ProfileDemanderGet,
  ProfileDemanderPatch,
  ProfileSupplierGet,
  ProfileSupplierPatch,
  ProfileUser,
  ReviewData,
  SupplierProfile,
} from './profile-type'
import ResourcePath from '../resource/resource-path'
import Data from '../../data/data'
import DIContainer from '../../config/inversify.config'
import { ParameterInvalidError } from '../../config/Error'
import { injectable } from 'inversify'
import { keys } from 'ts-transformer-keys'

@injectable()
export default class ProfileService {
  model = DIContainer.get(ProfileModel)
  styleModel = DIContainer.get(StyleModel)

  getMyProfile = async (userId: number, userType: string): Promise<unknown> => {
    switch (userType) {
      case 'S':
      case 'W':
        const profile = await this.model.getSupplier(userId)
        const point = await this.model.getSupplierPoint(userId)

        return { ...profile, ...point }
      case 'D':
        return await this.model.getDemander(userId)

      default:
        throw new ParameterInvalidError()
    }
  }

  saveProfile = async (
    userId: number,
    userType: string,
    data: any,
  ): Promise<void> => {
    await this.model.saveBasic(userId, data)

    const profile = await this.model.getProfile(userId)
    switch (userType) {
      case 'S':
      case 'W':
        {
          if (data.price != null) {
            await this.model.savePrice(userId, data.price)
          }

          let k: keyof SupplierProfile

          for (k in data as SupplierProfile) {
            if (data[k] != null) profile[k] = data[k]
          }
        }
        break
      case 'D':
        {
          let k: keyof DemanderProfile
          for (k in data as DemanderProfile) {
            if (data[k] != null) profile[k] = data[k]
          }
        }
        break
      default:
        throw new ParameterInvalidError()
    }
    await this.model.saveProfile(userId, profile)
  }

  getProfileSupplier = async (userId: number): Promise<ProfileSupplierGet> => {
    const {
      name,
      introduction,
      img,
      profile,
    } = await this.model.getBasicProfile(userId)
    const styles = await this.styleModel.getUserStyleOnlyValue(userId)

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
    const styles = await this.styleModel.getUserStyleOnlyValue(userId)
    const closetList = await this.model.getClosetList(userId)

    const additionalBodyStat = Data.getBodyItem(onboard['body'])
    if (profile == null) {
      profile = { bodyStat: { body: additionalBodyStat } }
    } else if (profile['bodyStat'] == null) {
      profile['bodyStat'] = additionalBodyStat
    } else if (profile.bodyStat.isPublic != true) {
      profile['bodyStat'] = additionalBodyStat
    } else {
      profile['bodyStat']['body'] = additionalBodyStat
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
    const styles = await this.styleModel.getUserStyleOnlyValue(userId)

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
    const styles = await this.styleModel.getUserStyleOnlyValue(userId)

    const closetList = await this.model.getClosetList(userId)
    const reviewList = await this.model.getReviewListDemander(userId)

    for (const item of reviewList) {
      item.img = ResourcePath.coordImg(item.img)
    }

    return {
      userType: 'D',
      name,
      introduction,
      img: ResourcePath.profileImg(img),
      ...profile,
      styles,
      closet: closetList,
      reviewList,
    } as ProfileDemanderGet
  }

  // patchDemander = async (
  //   userId: number,
  //   data: ProfileUser & ProfileDemanderPatch,
  // ) => {
  //   const baseData = await this.model.getBasicProfile(userId)
  //   const oldData = { ...baseData, ...baseData.profile }
  //   const {
  //     name,
  //     introduction,
  //     phone,
  //     hopeToSupplier,
  //     bodyStat,
  //   } = this.dataOverlap(oldData, data, ['hopeToSupplier', 'bodyStat'])
  //
  //   const profile = { hopeToSupplier, bodyStat }
  //
  //   await this.model.saveProfile(
  //     userId,
  //     name,
  //     phone,
  //     introduction,
  //     JSON.stringify(profile),
  //   )
  // }
  //
  // patchSupplier = async (
  //   userId: number,
  //   data: ProfileUser & ProfileSupplierPatch,
  // ) => {
  //   const baseData = await this.model.getBasicProfile(userId)
  //   const {
  //     name,
  //     introduction,
  //     phone,
  //     careerList,
  //     price,
  //     bank,
  //     account,
  //     accountUser,
  //   } = this.dataOverlap({ ...baseData, ...baseData.profile }, data, [
  //     'careerList',
  //     'price',
  //     'bank',
  //     'account',
  //     'accountUser',
  //   ])
  //
  //   await this.model.saveProfile(
  //     userId,
  //     name,
  //     phone,
  //     introduction,
  //     JSON.stringify({ careerList, account, bank, accountUser }),
  //   )
  //
  //   if (price != null) {
  //     await this.model.updateSupplierData(userId, price)
  //   }
  // }

  getLookbook = async (userId: number, page: number): Promise<{ list }> => {
    return {
      list: await this.model.getLookbookList(userId, page),
    }
  }

  getSupplierReview = async (
    supplierId: number,
    page: number,
  ): Promise<{
    rating: number | undefined
    totalCount: number
    list: ReviewData[]
  }> => {
    const base = await this.model.getReviewListSupplier(supplierId, page)
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

      const img = [...reviewImg.map((row) => ResourcePath.reviewImg(row.img))]

      const year = date.getFullYear()
      const month = ('0' + (1 + date.getMonth())).slice(-2)
      const day = ('0' + date.getDate()).slice(-2)

      const item: ReviewData = {
        id,
        name,
        img,
        rating,
        content,
        coordImg:
          coordImg == null
            ? []
            : coordImg.map((img) => ResourcePath.coordImg(img)),
        profileImg: ResourcePath.profileImg(profileImg),
        date: `${year}-${month}-${day}`,
        body: Data.getBodyItem(onboard['body']),
        styleTypeList: type == null ? [] : Data.getStyleItemList(type),
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
}
