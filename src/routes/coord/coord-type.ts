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
