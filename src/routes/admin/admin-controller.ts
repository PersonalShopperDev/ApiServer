import AdminService from './admin-service'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import path from 'path'
import * as fs from 'fs'
import ejs from 'ejs'

export default class AdminController {
  service = new AdminService()

  getSupplierPage = async (req, res) => {
    const file = fs.readFileSync(
      path.join(__dirname, '../../../data/admin', 'main.html'),
      'utf-8',
    )

    const page = ejs.render(file, {
      content: await this.service.getSupplierList(),
    })

    res.send(page)
  }

  getPaymentPage = async (req, res) => {
    const file = fs.readFileSync(
      path.join(__dirname, '../../../data/admin', 'main.html'),
      'utf-8',
    )

    const page = ejs.render(file, {
      content: await this.service.getPaymentList(),
    })

    res.send(page)
  }

  getLoginPage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../../data/admin', '/login.html'))
  }

  acceptSupplier = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      console.log(validationResult(req))
      res.redirect('/admin/supplier')
      return
    }

    const { id } = req.params
    const { career } = req.body

    await this.service.acceptSupplier(id, career)

    res.redirect('/admin/supplier')
  }

  acceptPaymentAccount = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      console.log(validationResult(req))
      res.redirect('/admin/payment')
      return
    }

    const { id } = req.params

    await this.service.acceptPaymentAccount(id)

    res.redirect('/admin/payment')
  }

  loginAdmin = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.redirect('/admin.login')
      return
    }

    const { id, pw } = req.body

    if (!(id === '아무튼관리자' && pw === 'duffufkckaRo')) {
      res.redirect('/admin/login')
      return
    }

    const expireTime =
      process.env.NODE_MODE == 'development' ? 60 * 60 * 24 * 30 : 60 * 60

    res.cookie(
      'a_jwt',
      jwt.sign({ admin: true }, process.env.JWT_KEY, { expiresIn: expireTime }),
      {
        maxAge: expireTime * 1000,
        httpOnly: true,
        secure: process.env.NODE_MODE != 'development',
      },
    )

    res.redirect('/admin')
  }
}
