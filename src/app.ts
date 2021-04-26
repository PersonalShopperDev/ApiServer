import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import logger from 'morgan'
import docRouter from './api/docs'

const app = express()

app.set('port', process.env.PORT || 3000)
if (process.env.NODE_MODE === 'development') app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/health', (req: express.Request, res: express.Response) => {
  res.sendStatus(200)
})
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('hello!')
})
if (docRouter) app.use('/docs', docRouter)

app.use(function (req: express.Request, res: express.Response) {
  res.sendStatus(404)
})

export default app
