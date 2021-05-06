import express, { Request, Response } from 'express'
import redoc from 'redoc-express'

const router = express.Router()

router.get(
  '/',
  redoc({
    title: 'API Docs',
    specUrl: '/docs/swagger',
  }),
)

router.get('/swagger', (req: Request, res: Response) => {
  res.sendFile('dist/docs.yaml', { root: '.' })
})

export default process.env.NODE_MODE === 'development' ? router : null
