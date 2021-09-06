import ProfileModel from './profile-model'
import StyleModel from '../style/style-model'
import {
  ProfileDemanderGet,
  ProfileSupplierGet,
  ReviewData,
} from './profile-type'
import ResourcePath from '../resource/resource-path'
import Data from '../../data/data'
import DIContainer from '../../config/inversify.config'
import { NoContentError } from '../../config/Error'
import { injectable } from 'inversify'
import { UserManager } from '../auth/auth-model'
import { IdValuePair } from '../../data/data-type'

@injectable()
export default class ProfileService {
  model = DIContainer.get(ProfileModel)
  styleModel = DIContainer.get(StyleModel)
  userManager = DIContainer.get(UserManager)

  getProfile = async (userId: number): Promise<unknown> => {
    const userType = await this.userManager.getUserType(userId)
    switch (userType) {
      case 'S':
      case 'W':
        return await this.getSupplierProfile(userId)
      case 'D':
        return await this.getDemanderProfile(userId)
      default:
        throw new NoContentError()
    }
  }

  getMyProfile = async (userId: number, userType: string): Promise<unknown> => {
    switch (userType) {
      case 'S':
      case 'W':
        return await this.getSupplierProfile(userId, false)
      case 'D':
        return await this.getDemanderProfile(userId, false)

      default:
        throw new NoContentError()
    }
  }

  private getDemanderProfile = async (userId: number, isHideInfo = true) => {
    const result = await this.model.getDemander(userId)

    if (isHideInfo) {
      result.email = undefined
      result.phone = undefined
      if (result.bodyStat?.isPublic == false) {
        result.bodyStat = undefined
      }
    }

    return result
  }
  private getSupplierProfile = async (userId: number, isHideInfo = true) => {
    const profile = await this.model.getSupplier(userId)
    const point = await this.model.getSupplierPoint(userId)

    if (isHideInfo) {
      profile.email = undefined
      profile.phone = undefined
      profile.account = undefined
      profile.accountUser = undefined
      profile.bank = undefined
    }

    const styles = {
      male: [] as IdValuePair[],
      female: [] as IdValuePair[],
    }

    if (profile.styles != null) {
      for (const s of profile.styles) {
        if (s.id % 10 == 1) {
          styles.male.push(s)
        } else {
          styles.female.push(s)
        }
      }
    }

    return { ...profile, styles, ...point }
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

          const fields = ['price', 'account', 'bank', 'accountUser'] as const

          for (const key of fields) {
            if (data[key] != null) profile[key] = data[key]
          }
        }
        break
      case 'D':
        {
          const fields = [
            'body',
            'skin',
            'bodyStat',
            'clothSize',
            'clothPrice',
          ] as const

          for (const key of fields) {
            if (data[key] != null) profile[key] = data[key]
          }
        }
        break
      default:
        throw new NoContentError()
    }
    await this.model.saveProfile(userId, profile)
  }

  getCloset = async (userId: number, page: number): Promise<{ list }> => {
    return {
      list: await this.model.getCloset(userId, page),
    }
  }
  deleteCloset = async (closetId: number, userId: number): Promise<void> => {
    // TODO : S3 에서도 처리
    await this.model.deleteCloset(closetId, userId)
  }
  postCloset = async (userId: number, path: string): Promise<number> => {
    return await this.model.postCloset(userId, path)
  }

  getLookbook = async (userId: number, page: number): Promise<{ list }> => {
    return {
      list: await this.model.getLookbookList(userId, page),
    }
  }
  deleteLookbook = async (
    lookbookId: number,
    userId: number,
  ): Promise<void> => {
    // TODO : S3 에서도 처리
    await this.model.deleteLookbook(lookbookId, userId)
  }
  postLookbook = async (
    userId: number,
    path: string,
    represent: boolean,
  ): Promise<number> => {
    return await this.model.postLookbook(userId, path, represent)
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
        body: Data.getBodyItem(profile['body']),
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
  deleteProfileImg = async (userId: number): Promise<void> => {
    // TODO : S3 에서도 처리
    await this.model.deleteProfileImg(userId)
  }
}
