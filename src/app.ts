import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import logger from 'morgan'
import docController from './routes/docs'
import authRouter from './routes/auth/auth-router'
import resourceRouter from './routes/resource/resource-router'
import cors from 'cors'

const app = express()

app.set('port', process.env.PORT || 3000)
if (process.env.NODE_MODE === 'development') app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.use('/health', (req: express.Request, res: express.Response) => {
  res.sendStatus(200)
})

if (docController) app.use('/docs', docController)
app.use('/v1/resource', resourceRouter)
app.use('/v1/auth', authRouter)

app.use(function (req: express.Request, res: express.Response) {
  res.sendStatus(404)
})

export default app
