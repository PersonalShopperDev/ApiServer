import express from 'express'
import { oneOf, query } from 'express-validator'
import { AuthCheck, AuthRequire } from '../../config/auth-check'
import UserController from './user-controller'

const router = express.Router()
const controller = new UserController()

const supplierTypeValidation = () =>
  oneOf([
    query('supplierType').isEmpty(),
    [
      query('supplierType').isArray(),
      query('supplierType.*').isInt({ min: 0, max: 2 }),
    ],
    query('supplierType').isInt({ min: 0, max: 2 }),
  ])

router.get(
  '/supplier',
  supplierTypeValidation(),
  AuthRequire,
  controller.getSupplier,
)
router.get(
  '/supplier/filter',
  oneOf([query('styleType').isArray(), query('styleType').isInt()]),
  supplierTypeValidation(),
  AuthCheck,
  controller.getSupplierListFilter,
)

router.get('/demander', AuthRequire, controller.getDemander)

export default router
