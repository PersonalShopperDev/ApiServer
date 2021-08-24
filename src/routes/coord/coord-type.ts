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
  comment: string
  clothes: Cloth[]
  referenceImgs: string[]
}

export interface CoordForSave extends Coord {
  roomId: number
}

export interface Cloth {
  price: number
  purchaseUrl: string
  img: string
}
