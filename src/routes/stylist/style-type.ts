export interface Stylist {
  id: number
  img: string
  name: string
  hireCount: number
  reviewCount: number
  type: Array<string>
}

export interface StylistList {
  list: Array<Stylist>
  totalCount: number
}
