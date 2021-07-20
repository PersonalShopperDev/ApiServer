import ChatModel from './chat-model'
import { ChatHistoryData, ChatRoomDetail, ChatUserProfile } from './chat-type'
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

    let roomId = await this.model.getChatRoomId(demaderId, supplierId)
    if (roomId == null) {
      roomId = await this.model.newChatRoom(demaderId, supplierId)
      ChatSocket.getInstance().newChat([userId, targetId], roomId)
    }

    return { roomId }
  }

  checkRoom = async (
    roomId: number,
    userId: number,
  ): Promise<number | null> => {
    const roomData = await this.model.getChatRoom(roomId)

    let targetId: number
    let ch = false

    for (const user of roomData.users) {
      if (userId == user) {
        ch = true
      } else {
        targetId = user
      }
    }

    if (ch) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return targetId!
    }

    return null
  }

  getProfile = async (userId: number): Promise<ChatUserProfile> => {
    const result = await this.model.getChatProfile(userId)
    result.profileImg = ResourcePath.profileImg(result.profileImg)
    return result
  }

  getChatHistory = async (
    userId: number,
    roomId: number,
    olderChatId: number | undefined,
  ): Promise<Array<ChatHistoryData>> => {
    const historyList = await this.model.getChatHistory(roomId, olderChatId)
    const result: ChatHistoryData[] = []
    for (const item of historyList.reverse()) {
      const { chatId, createTime, type } = item
      switch (type) {
        case 1:
          result.push({
            chatId,
            chatTime: createTime,
            chatType: type,
            msg: item.msg,
            price: item.price,
          })
          break
        case 2:
          // TODO : Coord
          // result.push({
          //   chatId,
          //   chatTime: createTime,
          //   chatType: type,
          //   coordTitle: item.msg,
          //   coordImg: ResourcePath.coordImg(item.subData),
          // })
          break
        case 0:
        default:
          result.push({
            chatId,
            chatTime: createTime,
            chatType: type,
            msg: item.msg,
          })
          break
      }
    }

    return result
  }
}
