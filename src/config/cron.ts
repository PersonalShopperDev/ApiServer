import cron from 'node-cron'
import db from './db'

export const updateSupplierPopular = cron.schedule('0 0 0 * * *', async () => {
  const connection = await db.getConnection()
  try {
    const sql = `UPDATE suppliers s,
(SELECT supplier_id, COUNT(*) * 4 AS hirePoint FROM coords c WHERE create_date >= DATE_ADD(NOW(),INTERVAL -1 WEEK) GROUP BY supplier_id) h
SET s.popular = h.hirePoint WHERE s.user_id = h.supplier_id;`
    await connection.query(sql)
  } catch (e) {
  } finally {
    connection.release()
  }
})
