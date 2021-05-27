import { injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import { Banner, Review, Stylist } from './home-type'

export default class HomeClass {
  getBanners = async (): Promise<Array<Banner>> => {}
  getStylists = async (): Promise<Array<Stylist>> => {}
  getReviews = async (): Promise<Array<Review>> => {}
}
