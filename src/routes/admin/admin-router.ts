import express from 'express'
import { body } from 'express-validator'
import AdminController from './admin-controller'
import jwt from 'jsonwebtoken'

const router = express.Router()
const adminController = new AdminController()

router.get('/login', adminController.getLoginPage)
router.post(
  '/login',
  body('id').isString(),
  body('pw').isString(),
  adminController.loginAdmin,
)

router.use((req, res, next) => {
  try {
    const payload = jwt.verify(req.cookies.a_jwt, process.env.JWT_KEY)
    if (payload.admin && payload.exp > new Date().getTime() * 0.001) {
      next()
    } else {
      res.redirect('/admin/login')
    }
  } catch (e) {
    res.redirect('/admin/login')
  }
})

router.get('/', adminController.getSupplierPage)
router.get('/supplier', adminController.getSupplierPage)
router.get('/payment', adminController.getPaymentPage)
router.post('/payment/:id/accept', adminController.acceptPaymentAccount)
router.post(
  '/supplier/:id/accept',
  body('career').isInt(),
  adminController.acceptSupplier,
)

export default router
