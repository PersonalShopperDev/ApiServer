import { Request, Response } from 'express'
import PaymentService from './payment-service'
import ChatSocket from '../chat/chat-socket'

export default class PaymentController {
  service = new PaymentService()

  getList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const { page } = req.query as any

      const data = await this.service.getPaymentList(userId, page ?? 0)

      res.status(200).json(data)
    } catch (e) {
      res.sendStatus(500)
    }
  }

  request = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const roomId = Number(req.params.roomId)

      if (!(await this.service.checkRoom(roomId, userId))) {
        res.sendStatus(403)
        return
      }

      const paymentId = await this.service.createPayment(roomId, userId)

      if (paymentId != null) {
        await ChatSocket.getInstance().sendNotice(
          roomId,
          '결제가 요청되었습니다.',
        )
        await ChatSocket.getInstance().notifyChangePayment(roomId)
        res.sendStatus(201)
      } else {
        res.sendStatus(351)
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }

  completeAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req['auth']
      const roomId = Number(req.params.roomId)
      const { name } = req.body

      if (!(await this.service.checkRoom(roomId, userId))) {
        res.sendStatus(403)
        return
      }

      const payment = await this.service.getPayment(roomId)
      if (payment == null || payment.status != 1) {
        res.sendStatus(400)
        return
      }

      await this.service.completeAccount(payment.paymentId, name)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
