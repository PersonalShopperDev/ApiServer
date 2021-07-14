import { Socket } from 'socket.io'

export default class ChatSocket {
  connect = async (socket: Socket) => {
    console.log(socket.id)
    const instanceId = socket.id

    socket.emit('message', 'HI')

    socket.on('sendMsg', this.onSendMsg)

    socket.on('sendEstimate', this.onSendEstimate)

    socket.on('sendCoord', this.onSendCoord)

    socket.on('responseEstimate', this.onResponseEstimate)
  }

  private onSendMsg = async (data) => {}
  private onSendEstimate = async (data) => {}
  private onSendCoord = async (data) => {}
  private onResponseEstimate = async (data) => {}
}
