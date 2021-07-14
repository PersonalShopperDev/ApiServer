import { Socket } from 'socket.io'
import { checkAuthorization, JwtPayload } from '../../config/auth-check'
import ChatModel from './chat-model'
export default class ChatSocket {
  private static instance: ChatSocket
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}
  static getInstance = (): ChatSocket => {
    return ChatSocket.instance || (ChatSocket.instance = new ChatSocket())
  }

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

    socket.join(chatRoomList.map((roomId) => roomId.toString()))

    socket.on('sendMsg', async (data) => {
      await this.onSendMsg(socket, userId, data)
    })

    socket.on('sendEstimate', async (data) => {
      await this.onSendEstimate(socket, userId, data)
    })

    socket.on('sendCoord', this.onSendCoord)

    socket.on('responseEstimate', async (data) => {
      await this.onResponseEstimate(socket, userId, data)
    })
  }

  private onSendMsg = async (socket: Socket, userId: number, data) => {
    const { roomId, msg } = JSON.parse(data)

    if (isNaN(Number(roomId)) || msg == null) {
      socket.emit('error', 422)
      return
    }

    await this.model.saveMsg(roomId, userId, 0, msg, null)

    socket
      .to(roomId.toString())
      .emit('receiveMsg', { roomId, msg, chatType: 0 })
  }
  private onSendEstimate = async (socket: Socket, userId: number, data) => {
    const { roomId, msg, price } = JSON.parse(data)

    if (isNaN(Number(roomId)) || msg == null || isNaN(Number(price))) {
      socket.emit('error', 422)
      return
    }

    await this.model.saveMsg(roomId, userId, 1, msg, price)

    socket
      .to(roomId.toString())
      .emit('receiveMsg', { roomId, msg, price, chatType: 1 })
  }
  private onSendCoord = async (data) => {}

  private onResponseEstimate = async (socket: Socket, userId: number, data) => {
    const { roomId, value } = JSON.parse(data)
    if (isNaN(Number(roomId)) || typeof value == 'boolean') {
      socket.emit('error', 422)
      return
    }

    await this.model.saveMsg(roomId, userId, 3, value, null)

    socket.to(roomId.toString()).emit('responseEstimate', { roomId, value })
  }
}
