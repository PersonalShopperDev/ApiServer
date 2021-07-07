import StyleModel from '../style/style-model'
import { StyleType } from '../style/style-type'
import { IdValuePair } from '../../data/data-type'

export type ProfileDemanderGet = UserProfileGet &
  ProfileDemanderPatch &
  DemanderNotPatch
export type ProfileSupplierGet = UserProfileGet &
  ProfileSupplierPatch &
  SupplierNotPatch

export interface ProfileUser {
  name: string | undefined
  introduction: string | undefined
}

export interface UserProfileGet extends ProfileUser {
  userType: string
  profileImg: string
  styles: string[] | undefined
}

export interface ProfileDemanderPatch {
  hopeToSupplier: string | undefined
  bodyStat: BodyStat | undefined
}

export interface ProfileSupplierPatch {
  price: number | undefined
  careerList: Career[] | undefined
}

interface DemanderNotPatch {
  closet: Img[] | undefined
  reviewList: Review[] | undefined
}

interface SupplierNotPatch {
  coord: Img[] | undefined
}

interface BodyStat {
  isPublic: boolean
  height: number
  weight: number
}

interface Career {
  type: number
  value: string
}

interface Review {
  id: number
  img: string
  status: number
}

export interface Img {
  id: number
  img: string
}

interface _ReviewData {
  id: number
  name: string
  profileImg: string
  rating: number
  content: string
}

export interface ReviewModelData extends _ReviewData {
  date: Date
  publicBody: number
  coordImg: string
  type: number[]
  profile: any
  onboard: any
}

export interface ReviewData extends _ReviewData {
  date: string
  img: string[]
  weight: number | undefined
  height: number | undefined
  body: IdValuePair
  styleTypeList: StyleType[]
}
