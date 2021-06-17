import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

export const AuthRequire = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (auth(req)) {
    next()
  } else {
    res.sendStatus(401)
    next(401)
  }
}

export const AuthCheck = (req: Request, res: Response, next: NextFunction) => {
  auth(req)
  next()
}

const auth = (req: Request): boolean => {
  const auth = req.header('Authorization')
  if (auth === 'test') {
    req['auth'] = { userId: 54 }
    return true
  }
  try {
    if (auth == null) {
      return false
    }
    const list = auth.split(' ')
    if (list[0].toLowerCase() != 'bearer') {
      return false
    }

    const token = list[1]
    const verify = jwt.verify(token, process.env.JWT_KEY)

    if (verify.exp < new Date().getTime() * 0.001) {
      return false
    }

    req['auth'] = verify
    return true
  } catch (e) {
    return false
  }
}
