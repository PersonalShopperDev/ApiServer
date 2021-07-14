import { Socket } from 'socket.io'
import { checkAuthorization, JwtPayload } from '../../config/auth-check'
import ChatModel from './chat-model'
export default class ChatSocket {
  private model = new ChatModel()

  connect = async (socket: Socket) => {
    const auth = socket.handshake.auth

    const jwt = checkAuthorization(auth.Authorization)
    if (jwt == null) {
      socket.disconnect(true)
      return
    }

    const { userId } = jwt

    const chatRoomList = await this.model.getChatRooms(jwt.userId)

    socket.join(chatRoomList.map((chatId) => chatId.toString()))

    socket.on('sendMsg', async (data) => {
      this.onSendMsg(socket, userId, data)
    })

    socket.on('sendEstimate', this.onSendEstimate)

    socket.on('sendCoord', this.onSendCoord)

    socket.on('responseEstimate', this.onResponseEstimate)
  }

  private onSendMsg = async (socket: Socket, userId: number, data) => {
    const { chatId, msg } = JSON.parse(data)

    if (isNaN(Number(chatId)) || msg == null) {
      socket.emit('error', 422)
      return
    }

    await this.model.saveMsg(chatId, userId, msg)

    socket
      .to(chatId.toString())
      .emit('receiveMsg', { chatId, msg, chatType: 0 })
  }
  private onSendEstimate = async (data) => {}
  private onSendCoord = async (data) => {}
  private onResponseEstimate = async (data) => {}
}
