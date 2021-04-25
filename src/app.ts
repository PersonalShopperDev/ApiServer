import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import env from 'dotenv'
import logger from 'morgan'
import createError from 'http-errors'

const app = express()

env.config()

app.set('port', process.env.PORT || 3000)
if (process.env.NODE_MODE === 'development') app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/health', (req: express.Request, res: express.Response) => {
  res.status(200)
})
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('hello!')
})

app.use(function (req: express.Request, res: express.Response) {
  res.send(404)
})

export default app
