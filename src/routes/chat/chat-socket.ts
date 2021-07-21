import { Namespace, Server, Socket } from 'socket.io'
import { checkAuthorization, JwtPayload } from '../../config/auth-check'
import ChatModel from './chat-model'
export default class ChatSocket {
  private static instance: ChatSocket
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor(io: Namespace) {
    this.io = io
  }

  private io: Namespace
  private userSocketMap = {}

  static getInstance = (): ChatSocket => {
    return ChatSocket.instance
  }

  static createInstance = (io: Namespace): ChatSocket => {
    return ChatSocket.instance || (ChatSocket.instance = new ChatSocket(io))
  }

  private model = new ChatModel()

  newChat = (userIds: number[], roomId: number) => {
    const socketIds = userIds.map((id) => this.userSocketMap[id])
    for (const socket of this.io.sockets) {
      if (socketIds.includes(socket[0])) {
        socket[1].join(roomId.toString())
      }
    }
  }

  connect = async (socket: Socket) => {
    const auth = socket.handshake.auth

    const jwt = checkAuthorization(auth.Authorization)
    if (jwt == null) {
      socket.disconnect(true)
      return
    }

    const { userId } = jwt

    this.userSocketMap[userId] = socket.id
    socket.on('disconnect', () => {
      this.userSocketMap[userId] = undefined
    })

    const chatRoomList = await this.model.getChatRooms(jwt.userId)

    socket.join(chatRoomList.map((item) => item.roomId.toString()))

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
    try {
      const { roomId, msg } = data

      if (isNaN(Number(roomId)) || msg == null) {
        socket.emit('error', 422)
        return
      }

      if (!socket.rooms.has(roomId.toString())) {
        socket.emit('error', 400)
        return
      }

      const chatId = await this.model.saveMsg(roomId, userId, 0, msg, null)

      socket.to(roomId.toString()).emit('receiveMsg', {
        roomId,
        chatId,
        chatTime: new Date(),
        msg,
        chatType: 0,
      })
    } catch (e) {
      socket.emit('error', 500)
    }
  }
  private onSendEstimate = async (socket: Socket, userId: number, data) => {
    try {
      const { roomId, msg, price, account, bank } = data

      if (
        isNaN(Number(roomId)) ||
        msg == null ||
        isNaN(Number(price)) ||
        account == null ||
        bank == null
      ) {
        socket.emit('error', 422)
        return
      }

      if (!socket.rooms.has(roomId.toString())) {
        socket.emit('error', 400)
        return
      }

      const estimateId = await this.model.newEstimate(
        roomId,
        account,
        bank,
        price,
      )

      const chatId = await this.model.saveMsg(
        roomId,
        userId,
        1,
        msg,
        estimateId,
      )

      socket.to(roomId.toString()).emit('receiveMsg', {
        roomId,
        chatId,
        chatTime: new Date(),
        msg,
        price,
        chatType: 1,
      })
    } catch (e) {
      socket.emit('error', 500)
    }
  }
  private onSendCoord = async (data) => {}

  private onResponseEstimate = async (socket: Socket, userId: number, data) => {
    try {
      const { estimateId, value } = data
      if (isNaN(Number(estimateId)) || typeof value != 'boolean') {
        socket.emit('error', 422)
        return
      }

      const roomData = await this.model.getChatRoomIdWithEstimate(estimateId)
      if (roomData == null || roomData.demanderId != userId) {
        socket.emit('error', 400)
        return
      }

      await this.model.saveEstimate(estimateId, value ? 2 : 1)

      const { roomId } = roomData

      socket
        .to(roomId.toString())
        .emit('responseEstimate', { roomId, estimateId, value })
    } catch (e) {
      socket.emit('error', 500)
    }
  }
}
