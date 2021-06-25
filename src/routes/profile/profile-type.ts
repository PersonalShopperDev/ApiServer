export type DemanderGet = ProfileDemanderPatch & DemanderNotPatch
export type SupplierGet = ProfileSupplierPatch & SupplierNotPatch

export interface ProfileUser {
  name: string | undefined
  introduction: string | undefined
}

export interface UserProfileGet extends ProfileUser {
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

interface Img {
  id: number
  img: string
}
