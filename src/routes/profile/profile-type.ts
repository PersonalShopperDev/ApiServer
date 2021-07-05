import StyleModel from '../style/style-model'
import { StyleType } from '../style/style-type'

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

export interface ReviewModelData {
  id: number
  coordImg: string
  content: string
  rating: number
  publicBody: number
  type: number[]
  profile: any
  onboard: any
  date: Date
}

export interface ReviewData {
  id: number
  img: string[]
  rating: number
  content: string
  date: Date
  weight: number | undefined
  height: number | undefined
  body: string
  styleTypeList: StyleType[]
}
