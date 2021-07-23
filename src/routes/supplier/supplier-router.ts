import express from 'express'
import { oneOf, query } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import SupplierController from './supplier-controller'

const router = express.Router()
const controller = new SupplierController()

const supplierTypeValidation = () =>
  oneOf([
    query('supplierType').isEmpty(),
    [
      query('supplierType').isArray(),
      query('supplierType.*').isInt({ min: 0, max: 2 }),
    ],
    query('supplierType').isInt({ min: 0, max: 2 }),
  ])

router.get('/', supplierTypeValidation(), AuthRequire, controller.getList)
router.get(
  '/search',
  oneOf([query('styleType').isArray(), query('styleType').isInt()]),
  supplierTypeValidation(),
  AuthCheck,
  controller.getSearchList,
)

export default router
