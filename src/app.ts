import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import logger from 'morgan'
import docController from './api/docs'
import authController from './api/AuthController'

const app = express()

app.set('port', process.env.PORT || 3000)
if (process.env.NODE_MODE === 'development') app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/health', (req: express.Request, res: express.Response) => {
  res.sendStatus(200)
})

if (docController) app.use('/docs', docController)
app.use('/auth', authController)

app.use(function (req: express.Request, res: express.Response) {
  res.sendStatus(404)
})

export default app
