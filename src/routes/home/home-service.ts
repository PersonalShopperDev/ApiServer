import { Banner, Demander, HomeData } from './home-type'
import HomeModel from './home-model'
import ResourcePath from '../resource/resource-path'

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
      const { title, img, supplierId } = item

      return { supplierId, title, img: ResourcePath.homeReviewImg(img) }
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
