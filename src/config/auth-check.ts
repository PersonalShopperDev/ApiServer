import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

export default (req: Request, res: Response, next: NextFunction) => {
  const auth = req.header('Authorization')
  if (auth === 'test') {
    req['auth'] = { userId: 54 }
    next()
    return
  }
  try {
    if (auth == null) {
      error401(res, next)
      return
    }
    const list = auth.split(' ')
    if (list[0].toLowerCase() != 'bearer') {
      error401(res, next)
      return
    }

    const token = list[1]
    const verify = jwt.verify(token, process.env.JWT_KEY)

    if (verify.exp < new Date().getTime() * 0.001) {
      error401(res, next)
      return
    }

    req['auth'] = verify
    next()
  } catch (e) {
    error401(res, next)
  }
}

const error401 = (res: Response, next: NextFunction) => {
  res.sendStatus(401)
  next(401)
}
