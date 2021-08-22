import express from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { logModule } from './config/logger'
import cors from 'cors'
import { Server } from 'socket.io'
import docController from './routes/docs'
import ChatSocket from './routes/chat/chat-socket'
import adminRouter from './routes/admin/admin-router'
import authRouter from './routes/auth/auth-router'
import homeRouter from './routes/home/home-router'
import resourceRouter from './routes/resource/resource-router'
import supplierRouter from './routes/user/user-router'
import onboardRouter from './routes/onboard/onboard-router'
import styleRouter from './routes/style/style-router'
import profileRouter from './routes/profile/profile-router'
import reviewRouter from './routes/review/review-router'
import chatRouter from './routes/chat/chat-router'
import coordRouter from './routes/coord/coord-router'
import noticeRouter from './routes/notice/notice-router'
import paymentRouter from './routes/payment/payment-router'
import { updateSupplierPopular } from './config/cron'

const corsUrl =
  process.env.node_mode == 'production'
    ? [
        'https://yourpersonalshoppers.com/',
        'https://www.yourpersonalshoppers.com/',
      ]
    : '*'

const corsOptions = {
  origin: corsUrl,
  credentials: true,
}

export const app = express()

const httpServer = createServer(app)
// const ioOption = { path: '/test' }
const ioOption = {
  path: '/v1/socket/',
  cors: {
    origin: corsUrl,
    allowedHeaders: ['Access-Control-Allow-Origin'],
  },
}
const io = new Server(httpServer, ioOption)

app.set('port', process.env.PORT || 3000)
app.use(logModule)
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors(corsOptions))

app.use('/health', (req: express.Request, res: express.Response) => {
  res.sendStatus(200)
})

if (docController) app.use('/docs', docController)
app.use('/admin', adminRouter)
app.use('/v1/resource', resourceRouter)
app.use('/v1/auth', authRouter)
app.use('/v1/home', homeRouter)
app.use('/v1/user', supplierRouter)
app.use('/v1/onboard', onboardRouter)
app.use('/v1/style', styleRouter)
app.use('/v1/profile', profileRouter)
app.use('/v1/review', reviewRouter)
app.use('/v1/chat', chatRouter)
app.use('/v1/payment', paymentRouter)
app.use('/v1/coord', coordRouter)
app.use('/v1/notice', noticeRouter)

const chatIo = io.of('/chat')

chatIo.on('connect', ChatSocket.createInstance(chatIo).connect)

app.use(function (req: express.Request, res: express.Response) {
  res.sendStatus(404)
})

export default httpServer

updateSupplierPopular.start()
