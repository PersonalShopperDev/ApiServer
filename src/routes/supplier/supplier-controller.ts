import { Request, Response } from 'express'
import SupplierService from './supplier-service'
import { validationResult } from 'express-validator'

interface Query {
  page: number | undefined
  sort: string | undefined
  supplierType: number | number[] | undefined
  styleType: number | number[]
}

export default class SupplierController {
  service = new SupplierService()

  getList = async (req: Request, res: Response): Promise<void> => {
    const { userId, gender } = req['auth']
    const { page, sort, supplierType }: Query = req.query as never

    if (!validationResult(req).isEmpty()) {
      res.sendStatus(422)
      return
    }

    try {
      const result = await this.service.getList(
        userId,
        gender,
        page,
        sort,
        supplierType,
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
    const { page, sort, styleType, supplierType }: Query = req.query as never
    const { gender } = req['auth']

    if (!validationResult(req).isEmpty() || styleType == null) {
      res.sendStatus(422)
      return
    }

    try {
      const result = await this.service.getSearchList(
        styleType,
        gender,
        page,
        sort,
        supplierType,
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
