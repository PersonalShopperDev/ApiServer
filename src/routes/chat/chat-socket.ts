import { Namespace, Socket } from 'socket.io'
import { checkAuthorization } from '../../config/auth-check'
import ChatModel from './chat-model'
import CoordModel from '../coord/coord-model'
import ResourcePath from '../resource/resource-path'

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
  private coordModel = new CoordModel()

  newChat = (userIds: number[], roomId: number) => {
    const socketIds = userIds.map((id) => this.userSocketMap[id])
    for (const socket of this.io.sockets) {
      if (socketIds.includes(socket[0])) {
        socket[1].join(roomId.toString())
      }
    }
  }

  sendCoord = async (
    roomId: number,
    userId: number,
    coordId: number,
    coordTitle: string,
    coordImg: string,
  ) => {
    const chatId = await this.model.saveMsg(
      roomId,
      userId,
      2,
      coordTitle,
      coordId,
    )

    this.io.to(roomId.toString()).emit('receiveMsg', {
      roomId,
      chatId,
      userId,
      chatTime: new Date(),
      chatType: 2,
      coordId,
      coordTitle,
      coordImg,
    })
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

    socket.on('sendCoord', async (data) => {
      await this.onSendCoord(socket, userId, data)
    })

    socket.on('responseEstimate', async (data) => {
      await this.onResponseEstimate(socket, userId, data)
    })

    socket.on('readMsg', async (data) => {
      await this.onReadMsg(socket, userId, data)
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
        socket.emit('error', 403)
        return
      }

      await this.model.readMsg(roomId, userId)

      const chatId = await this.model.saveMsg(roomId, userId, 0, msg, null)

      socket.to(roomId.toString()).emit('receiveMsg', {
        roomId,
        chatId,
        userId,
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
        socket.emit('error', 403)
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

      await this.model.readMsg(roomId, userId)

      socket.to(roomId.toString()).emit('receiveMsg', {
        roomId,
        chatId,
        userId,
        estimateId,
        chatTime: new Date(),
        msg,
        price,
        status: 0,
        chatType: 1,
      })
    } catch (e) {
      socket.emit('error', 500)
    }
  }

  private onSendCoord = async (socket: Socket, userId: number, data) => {
    try {
      const { roomId, coordId } = data
      if (isNaN(Number(roomId)) || isNaN(Number(coordId))) {
        socket.emit('error', 422)
        return
      }

      if (!socket.rooms.has(roomId.toString())) {
        socket.emit('error', 403)
        return
      }

      const coordData = await this.coordModel.getCoordBase(userId, coordId)

      if (coordData == null) {
        socket.emit('error', 403)
        return
      }

      const coordTitle = coordData.title
      const coordImg = ResourcePath.coordImg(coordData.mainImg)
      const chatId = await this.model.saveMsg(
        roomId,
        userId,
        2,
        coordTitle,
        coordId,
      )

      socket.to(roomId.toString()).emit('receiveMsg', {
        roomId,
        chatId,
        userId,
        chatTime: new Date(),
        chatType: 2,
        coordId,
        coordTitle,
        coordImg,
      })
    } catch (e) {
      socket.emit('error', 500)
    }
  }

  private onResponseEstimate = async (socket: Socket, userId: number, data) => {
    try {
      const { estimateId, value } = data
      if (isNaN(Number(estimateId)) || typeof value != 'boolean') {
        socket.emit('error', 422)
        return
      }

      const roomData = await this.model.getChatRoomIdWithEstimate(estimateId)
      if (roomData == null || roomData.demanderId != userId) {
        socket.emit('error', 403)
        return
      }

      await this.changeStatus(estimateId, userId, value ? 2 : 1)

      const { roomId } = roomData

      socket
        .to(roomId.toString())
        .emit('responseEstimate', { roomId, estimateId, value })
    } catch (e) {
      socket.emit('error', 500)
    }
  }

  private onReadMsg = async (socket: Socket, userId: number, data) => {
    try {
      const { roomId } = data

      if (isNaN(Number(roomId))) {
        socket.emit('error', 422)
        return
      }

      if (!socket.rooms.has(roomId.toString())) {
        socket.emit('error', 403)
        return
      }

      await this.model.readMsg(roomId, userId)

      socket.to(roomId.toString()).emit('readMsg', { roomId })
    } catch (e) {
      socket.emit('error', 500)
    }
  }

  changeStatus = async (
    estimateId: number,
    userId: number | null,
    newStatus: number,
  ): Promise<boolean> => {
    try {
      const estimate = await this.model.getEstimate(estimateId)
      if (estimate == null) {
        return false
      }

      const { roomId, status } = estimate

      switch (status) {
        case 1:
        case 5:
          return false
        case 0: // 초기 상태
          if (!(newStatus == 1 || newStatus == 2)) {
            return false
          }
          break
        case 2: // 입금 요청 - 수락 상태
          if (newStatus != 3) {
            return false
          }
          break
        case 3: // 입금 확인 중 - 입금자 입력 이후
          if (!(newStatus == 3 || newStatus == 4)) {
            return false
          }
          break
        case 4: // 코디 진행 - 입금자 확인
          if (newStatus != 5) {
            return false
          }
          break
      }

      switch (newStatus) {
        case 1:
          await this.sendMsg(roomId, userId!, '거절되었습니다.')
          break
        case 2:
          await this.sendMsg(roomId, userId!, '수락되었습니다.')
          break
        case 4:
          await this.sendNotice(roomId, 5, '입금 확인 완료!')
          break
        case 5:
          await this.sendNotice(roomId, 5, '코디가 확정 되었습니다!')
          break
      }

      await this.model.setEstimateStatus(estimateId, newStatus)

      this.io.to(roomId.toString()).emit('onChangeEstimateStatus', {
        roomId,
        estimateId,
        status: newStatus,
      })
    } catch (e) {
      return false
    }
    return true
  }

  private sendMsg = async (
    roomId: number,
    userId: number,
    msg: string,
  ): Promise<void> => {
    const chatId = await this.model.saveMsg(roomId, userId, 0, msg, null)

    this.io.to(roomId.toString()).emit('receiveMsg', {
      roomId,
      userId,
      chatId,
      msg,
      chatType: 0,
      chatTime: new Date(),
    })
  }
  private sendNotice = async (
    roomId: number,
    chatType: number,
    msg: string,
  ): Promise<void> => {
    const chatId = await this.model.saveMsg(roomId, null, chatType, msg, null)

    this.io.to(roomId.toString()).emit('receiveMsg', {
      roomId,
      chatId,
      chatType,
      msg,
      chatTime: new Date(),
    })
  }
}
