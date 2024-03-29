import { IdValuePair } from '../../data/data-type'

export interface HomeData {
  banners: Array<Banner>
  suppliers: Array<Supplier>
  reviews: Array<Review>
}

export interface Banner {
  img: string
  action: { type: string; id: number }
}

export interface Supplier {
  id: number
  img: string | null
  name: string
  hireCount: number
  reviewCount: number
}

export interface Review {
  supplierId: number
  demanderId: number
  img: string
  content: string
  styleList: IdValuePair[]
  body: IdValuePair
}

export interface Demander {
  id: number
  img: string
  name: string
  styles: string[]
}
