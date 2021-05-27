import { Banner, Review, Stylist } from './home-type'

export default class HomeService {
  getBanners = async (): Promise<Array<Banner>> => {}
  getStylists = async (): Promise<Array<Stylist>> => {}
  getReviews = async (): Promise<Array<Review>> => {}
}
