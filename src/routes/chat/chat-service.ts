import ChatModel from './chat-model'
import { ChatRoomData, ChatRoomDetail, ChatUserProfile } from './chat-type'
import ResourcePath from '../resource/resource-path'
import ChatSocket from './chat-socket'

export default class ChatService {
  model = new ChatModel()

  getChatList = async (
    userId: number,
    page: number,
  ): Promise<ChatRoomDetail[]> => {
    const roomList = await this.model.getChatRoomsWithLastChat(userId, page)
    const result = [] as ChatRoomDetail[]

    for (const room of roomList) {
      const { roomId, users, lastChat, lastChatTime } = room
      const targetId = users.filter((u) => u != userId)[0]
      const targetUser = await this.model.getChatProfile(targetId)
      targetUser.profileImg = ResourcePath.profileImg(targetUser.profileImg)

      const item: ChatRoomDetail = {
        roomId,
        targetUser,
        lastChat,
        lastChatTime,
      }

      result.push(item)
    }

    return result
  }

  newChatList = async (
    userId: number,
    userType: string,
    targetId: number,
  ): Promise<{ roomId: number } | null> => {
    let demaderId = targetId
    let supplierId = userId

    if (userType == 'D') {
      demaderId = userId
      supplierId = targetId

      if (!(await this.model.checkSupplier(supplierId))) return null
    }

    let roomId = await this.model.getChatRoom(demaderId, supplierId)
    if (roomId == null) {
      roomId = await this.model.newChatRoom(demaderId, supplierId)
      ChatSocket.getInstance().newChat([userId, targetId], roomId)
    }

    return { roomId }
  }
}
