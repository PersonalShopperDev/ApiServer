import { Banner, Demander, HomeData } from './home-type'
import HomeModel from './home-model'
import ResourcePath from '../resource/resource-path'
import Data from '../../data/data'

export default class HomeService {
  model = new HomeModel()

  getHomeData = async (
    userId: number,
    gender: string | null,
  ): Promise<HomeData | null> => {
    const banners = (await this.model.getBanners()).map((item) => {
      return {
        img: ResourcePath.bannerImg(item.img),
        action: {
          type: item.actionType,
          id: item.actionArgId,
        },
      } as Banner
    })
    const suppliers =
      userId == null
        ? await this.model.getSupplier()
        : await this.model.getSupplierWithLogin(userId, gender)

    const reviews = (await this.model.getReviews()).map((item) => {
      const { demanderId, supplierId, content, img, style, profile } = item

      return {
        demanderId,
        supplierId,
        content,
        styleList: style == null ? [] : Data.getStyleItemList(style),
        body: Data.getBodyItem(profile.body),
        img: ResourcePath.homeReviewImg(img),
      }
    })

    if (!banners || !suppliers || !reviews) return null

    return {
      banners,
      suppliers,
      reviews,
    }
  }

  getDemanderList = async (userId: number): Promise<Demander[]> => {
    const result = await this.model.getDemanderWithLogin(userId)

    for (const item of result) {
      item.img = ResourcePath.profileImg(item.img)
    }
    return result
  }
}
