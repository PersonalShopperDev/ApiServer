import ChatModel from './chat-model'
import { ChatRoomData } from './chat-type'

export default class ChatService {
  model = new ChatModel()

  getChatList = async (userId): Promise<ChatRoomData[]> => {
    return this.model.getChatRooms(userId)
  }
}
