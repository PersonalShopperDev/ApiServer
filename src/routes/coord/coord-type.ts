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
