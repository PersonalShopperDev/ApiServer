export interface Supplier {
  id: number
  img: string
  name: string
  hireCount: number
  reviewCount: number
  type: Array<string>
}

export interface SupplierList {
  list: Array<Supplier>
  totalCount: number
}
