import db from '../../config/db'

export default class AdminModel {
  getSupplierList = async (): Promise<
    {
      id: number
      name: string
      gender: string
      email: string
      price: number
      supplyGender: number
      status: number
      profile: string
      onboard: string
      introduction: string
      create_time: Date
      update_time: Date
    }[]
  > => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT s.user_id as id, s.price, s.supplyGender, s.status, u.name, u.gender, u.email, u.img, u.profile, u.onboard, u.introduction, u.create_time, u.update_time FROM suppliers s
LEFT JOIN users u ON u.user_id = s.user_id
WHERE s.status = -1`
      const [rows] = await connection.query(sql)
      return rows as any
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  acceptSupplier = async (id: number, career: number): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE suppliers SET status=:career WHERE user_id=:id `
      const [rows] = await connection.query(sql, { id, career })
      return rows as any
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
