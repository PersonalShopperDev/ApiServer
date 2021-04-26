import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import env from 'dotenv'
import logger from 'morgan'
import redoc from 'redoc-express'

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

// serve your swagger.json file
app.get('/docs/swagger', (req, res) => {
  res.sendFile('swagger.yaml', { root: '.' })
})

app.get(
  '/docs',
  redoc({
    title: 'API Docs',
    specUrl: '/docs/swagger',
  }),
)

app.use(function (req: express.Request, res: express.Response) {
  res.send(404)
})

export default app
