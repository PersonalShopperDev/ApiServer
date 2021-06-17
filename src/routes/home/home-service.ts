import { Banner, HomeData, Review, Stylist } from './home-type'
import HomeModel from './home-model'

export default class HomeService {
  model = new HomeModel()

  getHomeData = async (userId): Promise<HomeData | null> => {
    const banners = await this.model.getBanners()
    const stylists =
      userId == null
        ? await this.model.getStylists()
        : await this.model.getStylistsWithStyle(userId)
    const reviews = await this.model.getReviews()

    if (!banners || !stylists || !reviews) return null

    return {
      banners,
      stylists,
      reviews,
    }
  }
}
