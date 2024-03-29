export interface PaymentHistory {
  paymentId: number
  price: number
  status: number
  paymentTime: Date
  targetUser: UserData
}

export interface UserData {
  userId: number
  name: string
  img: string
}
