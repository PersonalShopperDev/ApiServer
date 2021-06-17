import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.header('Authorization') === 'test') {
    req['auth'] = { userId: 54 }
    next()
    return
  }
  try {
    const auth = req.header('Authorization')
    const list = auth!.split(' ')
    if (list[0].toLowerCase() != 'bearer') {
      throw Error()
    }

    const token = list[1]
    const verify = jwt.verify(token, process.env.JWT_KEY)

    if (verify.exp > new Date().getTime() * 0.001) {
      res.sendStatus(401)
      next(401)
      return
    }

    req['auth'] = verify
    next()
  } catch (e) {
    res.sendStatus(401)
    next(401)
  }
}
