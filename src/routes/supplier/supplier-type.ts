export interface Supplier {
  id: number
  img: string
  name: string
  hireCount: number
  reviewCount: number
  styleTypeList: Array<type>
}

interface type {
  id: number
  value: string
}
