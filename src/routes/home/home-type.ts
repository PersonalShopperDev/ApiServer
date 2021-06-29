export interface HomeData {
  banners: Array<Banner>
  suppliers: Array<Supplier>
  reviews: Array<Review>
}

export interface Banner {
  img: string
}

export interface Supplier {
  id: number
  img: string | null
  name: string
  hireCount: number
  reviewCount: number
}

export interface Review {
  id: number
  supplierId: number
  beforeImg: string
  afterImg: string
  title: string
}
