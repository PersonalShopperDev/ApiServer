import cron from 'node-cron'
import DB from './db'
import DIContainer from './inversify.config'

const db = DIContainer.get(DB)

export const updateSupplierPopular = cron.schedule('0 0 0 * * *', async () => {
  const sql = `UPDATE suppliers s,
(
  SELECT s.user_id, cnt * 4 as point FROM suppliers s
  LEFT JOIN (
    SELECT r.user_id, COUNT(*) as cnt FROM payments e 
    LEFT JOIN room_user r ON r.room_id = e.room_id
    WHERE e.create_time >= DATE_ADD(NOW(),INTERVAL -1 WEEK)
    AND e.status >= 2
    AND r.user_type='S'
    GROUP BY r.user_id
  ) c ON c.user_id = s.user_id
) h
SET s.popular = h.point WHERE s.user_id = h.user_id;`
  await db.query(sql)
})
