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
