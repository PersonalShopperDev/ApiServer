import { IdValuePair } from '../../data/data-type'

interface User {
  id: number
  img: string
  name: string
  styleTypeList: Array<IdValuePair>
}

export interface Demander extends User {
  gender: string
}

export interface Supplier extends User {
  hireCount: number
  reviewCount: number
}
