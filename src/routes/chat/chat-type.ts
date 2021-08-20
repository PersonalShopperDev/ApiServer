export interface ChatRoomData {
  roomId: number
  users: number[]
}

export interface ChatRoomDetail {
  roomId: number
  targetUser: ChatUserProfile
  unreadCount: number
  lastChat: string
  lastChatType: string
  lastChatTime: Date
}

export interface ChatUserProfile {
  id: number
  profileImg: string
  name: string
}

export interface ChatHistoryModel {
  chatId: number
  userId: number
  chatType: string
  msg: string
  subData: number
  price: number
  status: number
  coordTitle: string
  coordImg: string
  createTime: Date
}

interface ChatBase {
  chatId: number
  userId: number
  chatType: string
  chatTime: Date
  isRead: boolean
}

export interface Estimate {
  estimateId: number
  roomId: number
  price: number
  status: number
}

export interface ChatSimpleMsg extends ChatBase {
  msg: string
}

export interface ChatEstimate extends ChatBase, Estimate {
  msg: string
}

export interface ChatCoord extends ChatBase {
  coordId: number
  coordTitle: string
  coordImg: string
}

export type ChatHistoryData = ChatSimpleMsg | ChatEstimate | ChatCoord
