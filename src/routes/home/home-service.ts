import { Banner, HomeData, Review, Supplier } from './home-type'
import HomeModel from './home-model'

export default class HomeService {
  model = new HomeModel()

  getHomeData = async (userId): Promise<HomeData | null> => {
    const banners = await this.model.getBanners()
    const suppliers =
      userId == null
        ? await this.model.getSupplier()
        : await this.model.getSupplierWithStyle(userId)
    const reviews = await this.model.getReviews()

    if (!banners || !suppliers || !reviews) return null

    return {
      banners,
      suppliers,
      reviews,
    }
  }
}
