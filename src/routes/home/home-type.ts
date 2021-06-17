export interface HomeData {
  banners: Array<Banner>
  stylists: Array<Stylist>
  reviews: Array<Review>
}

export interface Banner {
  img: string
}

export interface Stylist {
  id: number
  img: string | null
  name: string
  hireCount: number
  reviewCount: number
}

export interface Review {
  id: number
  stylistId: number
  beforeImg: string
  afterImg: string
  title: string
}
