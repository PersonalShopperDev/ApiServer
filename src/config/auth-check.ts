import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

export const AuthAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (checkHeader(req)) {
    if (process.env.ADMIN?.split(',').includes(req['auth'].userId.toString())) {
      req['auth']['isAdmin'] = true
      next()
      return
    }
  }
  res.sendStatus(401)
  next(401)
  return
}

export const AuthRequire = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (checkHeader(req)) {
    next()
  } else {
    res.sendStatus(401)
    next(401)
  }
}

export const AuthCheck = (req: Request, res: Response, next: NextFunction) => {
  checkHeader(req)
  next()
}

const checkHeader = (req: Request): boolean => {
  const auth = req.header('Authorization')
  const result = checkAuthorization(auth)
  if (result == null) {
    req['auth'] = {}
    return false
  } else {
    req['auth'] = result
    return true
  }
}

export const checkAuthorization = (
  t: string | undefined,
): JwtPayload | null => {
  try {
    if (t == null) {
      return null
    }
    const list = t.split(' ')
    if (list[0].toLowerCase() != 'bearer') {
      return null
    }

    const token = list[1]
    const verify = jwt.verify(token, process.env.JWT_KEY)

    if (verify.exp < new Date().getTime() * 0.001) {
      return null
    }

    return verify
  } catch (e) {
    return null
  }
}

export interface JwtPayload {
  userId: number
  gender: string | undefined
  email: string | undefined
}
