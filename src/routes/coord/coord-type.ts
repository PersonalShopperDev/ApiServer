import { ImgFile } from '../../types/upload'

export interface CoordData {
  mainImg: string
  comment: string
  clothes: ClothData[]
}

export interface ClothData {
  name: string
  price: number
  purchaseUrl: string
  img: string
}

export interface ClothDataWithFile {
  name: string
  price: number
  purchaseUrl: string
  img: ImgFile
}

export interface CoordIdData {
  coordId: number
  estimateId: number
  paymentstatus: number
  roomId: number
}

export interface Coord {
  title: string
  comment: string
  clothes: Cloth[]
  referenceImgList: string[]
}

export interface CoordForGet extends Coord {
  supplier: Supplier
  needRequest: boolean
}

export interface Cloth {
  price: number
  purchaseUrl: string
  img: string
}

export interface Supplier {
  id: number
  name: string
  img: string
}
