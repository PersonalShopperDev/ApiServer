import { id, injectable } from 'inversify'
import axios from 'axios'
import db from '../../config/db'
import S3 from '../../config/s3'
import { RowDataPacket } from 'mysql2'
import { ProfileDemanderPatch, ProfileSupplierPatch } from './profile-type'
import { Request, Response } from 'express'

export default class ProfileModel {
  saveProfile = async (
    userId: number,
    name: string | undefined,
    introduction: string | undefined,
    profile: string | undefined,
  ): Promise<void> => {
    const connection = await db.getConnection()

    if (name == null && introduction == null && profile == null) return

    const data = { name, introduction, profile }
    let fields = ''
    for (const key in data) {
      if (data[key] != null) fields += `${key}=:${key},`
    }

    fields = fields.substring(0, fields.length - 1)

    const sql = `UPDATE users SET ${fields} WHERE user_id=:userId`

    const value = { userId, name, introduction, profile }

    await connection.query(sql, value)

    connection.release()
  }

  getBasicProfile = async (
    userId: number,
  ): Promise<ProfileDemanderPatch | ProfileSupplierPatch | null> => {
    const connection = await db.getConnection()
    const sql =
      'SELECT name, introduction, profile FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

    connection.release()

    if (rows[0] == null) return null
    const { name, introduction, profile } = rows[0]
    profile['name'] = name
    profile['introduction'] = introduction
    return profile
  }

  updateStylistData = async (userId: number, price: number): Promise<void> => {
    const connection = await db.getConnection()
    const sql = `UPDATE stylists SET price=:price WHERE user_id=:userId`

    const value = { userId, price }

    await connection.query(sql, value)

    connection.release()
  }

  postProfileImg = async (userId: number, path: string): Promise<number> => {
    const connection = await db.getConnection()
    const sql = `UPDATE users INTO img=:path WHERE user_id=:userId`

    const value = { userId, path }

    const [result] = await connection.query(sql, value)

    connection.release()
    return result['insertId']
  }

  postLookbook = async (
    userId: number,
    path: string,
    represent: boolean,
  ): Promise<number> => {
    const connection = await db.getConnection()
    const sql = `INSERT INTO lookbooks(img_path, user_id, represent) VALUES(:path, :userId, :represent)`

    const value = { userId, path, represent: represent ? 1 : 0 }

    const [result] = await connection.query(sql, value)

    connection.release()
    return result['insertId']
  }

  postCloset = async (userId: number, path: string): Promise<number> => {
    const connection = await db.getConnection()
    const sql = `INSERT INTO closet(img_path, user_id) VALUES(:path, :userId)`

    const value = { userId, path }

    const [result] = await connection.query(sql, value)

    connection.release()
    return result['insertId']
  }
}
