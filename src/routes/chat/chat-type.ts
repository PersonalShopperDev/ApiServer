export interface ChatRoomData {
  roomId: number
  users: number[]
}

export interface ChatRoomDetail {
  roomId: number
  targetUser: ChatUserProfile
  lastChat: string
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
  type: number
  msg: string
  price: number
  status: number
  createTime: Date
}

interface ChatBase {
  chatId: number
  userId: number
  chatType: number
  chatTime: Date
  isRead: boolean
}

export interface ChatSimpleMsg extends ChatBase {
  msg: string
}

export interface ChatEstimate extends ChatBase {
  msg: string
  price: number
  status: number
}

export interface ChatCoord extends ChatBase {
  coordTitle: string
  coordImg: string
}

export type ChatHistoryData = ChatSimpleMsg | ChatEstimate | ChatCoord
