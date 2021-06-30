export interface Supplier {
  id: number
  img: string
  name: string
  hireCount: number
  reviewCount: number
  styleTypeList: Array<type>
}

export interface SupplierList {
  list: Array<Supplier>
  totalCount: number
}

interface type {
  id: number
  value: string
}
