import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.header('Authorization')
    const list = auth!.split(' ')
    if (list[0].toLowerCase() != 'bearer') {
      throw Error()
    }

    const token = list[1]
    req['auth'] = jwt.verify(token, process.env.JWT_KEY)
    next()
  } catch (e) {
    res.sendStatus(401)
    next(401)
  }
}
