import ChatModel from './chat-model'
import { ChatRoomData } from './chat-type'

export default class ChatService {
  model = new ChatModel()

  getChatList = async (userId): Promise<ChatRoomData[]> => {
    return this.model.getChatRooms(userId)
  }

  newChatList = async (
    userId: number,
    targetId: number,
  ): Promise<{ roomId: number }> => {
    // TODO: target ID 검증

    const roomId = await this.model.newChatRooms(userId, targetId)
    return { roomId }
  }
}
