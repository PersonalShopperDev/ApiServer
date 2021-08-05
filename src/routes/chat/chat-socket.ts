import { Namespace, Socket } from 'socket.io'
import { checkAuthorization } from '../../config/auth-check'
import ChatModel from './chat-model'
import { logger } from '../../config/logger'
import axios from 'axios'
import crypto from 'crypto-js'

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

    await this.notification([userId], '코디가 도착했어요!\n확인하러 가볼까요?')
  }

  sendImg = async (roomId: number, userId: number, img: string) => {
    const chatId = await this.model.saveMsg(roomId, userId, 6, img, null)
    this.io.to(roomId.toString()).emit('receiveMsg', {
      roomId,
      userId,
      chatId,
      msg: img,
      chatType: 6,
      chatTime: new Date(),
    })

    await this.notification(
      [userId],
      '코디 관련 메시지가 왔습니다\n원활한 코디를 위해 빠르게 답장해주세요!',
    )
  }

  connect = async (socket: Socket) => {
    const auth = socket.handshake.auth

    const jwt = checkAuthorization(auth.Authorization)
    if (jwt == null) {
      socket.disconnect(true)
      return
    }

    const { userId, userType } = jwt

    this.userSocketMap[userId] = socket.id
    socket.on('disconnect', () => {
      this.userSocketMap[userId] = undefined
    })

    const chatRoomList = await this.model.getChatRooms(jwt.userId)

    socket.join(chatRoomList.map((item) => item.roomId.toString()))

    socket.use(([event, data], next) => {
      logger.info(
        `${new Date().toISOString()}|${userId}|${userType}|` +
          `SOCKET ${event}|${JSON.stringify(data)}`,
      )
      next()
    })

    socket.on('sendMsg', async (data) => {
      await this.onSendMsg(socket, userId, data)
    })

    socket.on('sendEstimate', async (data) => {
      await this.onSendEstimate(socket, userId, data)
    })

    socket.on('responseEstimate', async (data) => {
      await this.onResponseEstimate(socket, userId, data)
    })

    socket.on('readMsg', async (data) => {
      await this.onReadMsg(socket, userId, data)
    })
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
        case 0: // 초기 상태
          if (!(newStatus == 1 || newStatus == 2)) {
            return false
          }
          break
        case 1:
          return false
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
        case 5: // 코디 완료 - 리뷰 작성 필요
          if (newStatus != 6) {
            return false
          }
          break
        default:
          return false
      }

      switch (newStatus) {
        case 1:
          await this.sendMsg(roomId, userId!, '거절되었습니다.')
          break
        case 2:
          await this.sendMsg(roomId, userId!, '수락되었습니다.')
          await this.notification(
            [userId!],
            '견적서가 수락되었습니다\n코디하러 가볼까요?',
          )
          break
        case 4:
          await this.sendNotice(roomId, 5, '입금 확인 완료!')
          const rooms = await this.model.getChatRoom(roomId)

          await this.notification(rooms.users, '입금 확인이 완료되었습니다')
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

      await this.sendMsg(roomId, userId, msg)
      await this.model.readMsg(roomId, userId)
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

      // 최근 견적서가 마감이 안되어 있을 경우
      const latestEstimate = await this.model.getLatestEstimate(roomId)
      if (
        latestEstimate != null &&
        !(latestEstimate.status == 1 || latestEstimate?.status >= 5)
      ) {
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

      if (!(await this.changeStatus(estimateId, userId, value ? 2 : 1))) {
        return
      }

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

    await this.notification(
      [userId],
      '코디 관련 메시지가 왔습니다\n원활한 코디를 위해 빠르게 답장해주세요! ',
    )
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

  private notification = async (userId: number[], msg: string) => {
    msg = `[퍼스널쇼퍼]\n${msg}\nwww.yourpersonalshoppers.com`
    const dataList = await this.model.getNotificationData(userId)
    const messages: { to: string }[] = []

    for (const item of dataList) {
      const { time, phone } = item
      if (
        phone != null &&
        (time == null ||
          new Date().getTime() >= time.getTime() + 10 * 60 * 1000)
      ) {
        messages.push({ to: phone })
      }
    }

    if (messages.length == 0) return

    const body = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: '01050203105',
      content: msg,
      messages,
    }

    const accessKey = process.env.NAVER_CLOUD_KEY
    const method = 'POST'
    const space = ' '
    const newLine = '\n'
    const hmac = crypto.algo.HMAC.create(
      crypto.algo.SHA256,
      process.env.NAVER_CLOUD_SECRET,
    )

    const date = Date.now().toString()
    const uri = process.env.NAVER_CLOUD_ID
    const url = `/sms/v2/services/${uri}/messages`

    hmac.update(method)
    hmac.update(space)
    hmac.update(url)
    hmac.update(newLine)
    hmac.update(date)
    hmac.update(newLine)
    hmac.update(accessKey)

    const hash = hmac.finalize()
    const signature = hash.toString(crypto.enc.Base64)

    const result = await axios.post(
      `https://sens.apigw.ntruss.com${url}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': date,
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
      },
    )

    await this.model.refreshNotificationTime(
      messages.map((item) => Number(item.to)),
    )
  }
}
