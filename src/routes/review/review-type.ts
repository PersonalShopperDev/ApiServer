import { StyleType } from '../style/style-type'

export interface ReviewContent {
  content: string
  rating: number
  publicBody: boolean
}

export interface ReviewCoord {
  supplierId: number
  imgList: string[]
  profile: string
  title: string
  styleTypeList: StyleType[]
}
