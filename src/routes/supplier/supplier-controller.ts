import { Request, Response } from 'express'
import SupplierService from './supplier-service'
import { validationResult } from 'express-validator'

interface Query {
  page: number | undefined
  sort: string | undefined
  type: string | undefined
}

export default class SupplierController {
  service = new SupplierService()

  getList = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req['auth']
    const { page, sort }: Query = req.query as never

    try {
      const result = await this.service.getList(
        userId,
        page == null ? 0 : page,
        sort == null ? 'popular' : sort,
      )

      if (result == null) {
        res.sendStatus(400)
      } else {
        res.status(200).json(result)
      }
    } catch (e) {
      console.log(e)
      res.sendStatus(500)
    }
  }

  getSearchList = async (req: Request, res: Response): Promise<void> => {
    const { page, sort, type }: Query = req.query as never

    if (!validationResult(req).isEmpty() || type == null) {
      res.sendStatus(422)
      return
    }

    try {
      const result = await this.service.getSearchList(
        type,
        page == null ? 0 : page,
        sort == null ? 'popular' : sort,
      )

      if (result == null) {
        res.sendStatus(400)
      } else {
        res.status(200).json({ list: result })
      }
    } catch (e) {
      res.sendStatus(500)
    }
  }
}
