import { StyleType } from '../style/style-type'
import { IdValuePair } from '../../data/data-type'

export type Profile =
  | (BasicProfile & SupplierProfile)
  | (BasicProfile & DemanderProfile)

export interface BasicProfile {
  name: string
  email: string | undefined
  profileImg: string | undefined
  introduction: string | undefined
  styles: IdValuePair[] | undefined
  phone: string | undefined
}

export interface DemanderProfile {
  hopeToSupplier: string | undefined
  body: IdValuePair | undefined
  skin: IdValuePair | undefined
  bodyStat: BodyStat | undefined
  clothSize: ClothSize | undefined
  clothPrice: Price[] | undefined
}

export interface ClothSize {
  topSize: number | undefined
  bottomSize: number | undefined
  shoulderSize: number | undefined
  waistSize: number | undefined
  bellySize: number | undefined
  hipSize: number | undefined
}

export interface Price {
  topPrice: PriceContent | undefined
  bottomPrice: PriceContent | undefined
  dressPrice: PriceContent | undefined
  shoesPrice: PriceContent | undefined
  bagPrice: PriceContent | undefined
  accessoryPrice: PriceContent | undefined
}

interface PriceContent {
  min: number
  max: number
}

export interface SupplierProfile {
  phone: string | undefined
  price: number | undefined
  coord: string[] | undefined
  account: string | undefined
  bank: string | undefined
  accountUser: string | undefined
}

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
  phone: string
}

export interface ProfileSupplierPatch {
  price: number | undefined
  careerList: Career[] | undefined
  phone: string
  account: string
  bank: string
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

export interface Review {
  reviewId: number
  supplierId: number
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
  coordImg: string[]
  type: number[]
  profile: any | null
  onboard: any
}

export interface ReviewData extends _ReviewData {
  date: string
  coordImg: string[]
  img: string[]
  weight: number | undefined
  height: number | undefined
  body: IdValuePair
  styleTypeList: StyleType[]
}
