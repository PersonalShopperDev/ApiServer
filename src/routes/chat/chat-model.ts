import DB from '../../config/db'
import {
  ChatHistoryModel,
  ChatRoomData,
  ChatUserProfile,
  Payment,
} from './chat-type'
import DIContainer from '../../config/inversify.config'

export default class ChatModel {
  db = DIContainer.get(DB)

  checkSupplier = async (supplierId: number): Promise<boolean> => {
    const sql = `SELECT user_id FROM suppliers WHERE user_id=:supplierId`

    const value = { supplierId }
    const [rows] = await this.db.query(sql, value)

    return rows[0] != null
  }

  getChatRoom = async (roomId: number): Promise<ChatRoomData> => {
    const sql = `SELECT user_id FROM room_user WHERE room_id=:roomId;`

    const value = { roomId }
    const [rows] = await this.db.query(sql, value)

    return {
      roomId,
      users: rows.map((row) => row.user_id),
    }
  }

  getChatRooms = async (userId: number): Promise<ChatRoomData[]> => {
    const sql = `SELECT a.room_id as roomId, json_arrayagg(b.user_id) AS users FROM room_user a
RIGHT JOIN room_user b ON a.room_id = b.room_id
WHERE a.user_id = :userId
GROUP BY a.room_id;`

    const value = { userId }
    const [rows] = await this.db.query(sql, value)

    return rows.map((row) => {
      return {
        roomId: row.roomId,
        users: [row.supplier_id, row.demander_id],
      }
    })
  }

  getChatRoomsWithLastChat = async (
    userId: number,
    page: number,
  ): Promise<
    {
      roomId: number
      users: Array<number>
      lastChat: string
      lastChatType: string
      lastChatTime: Date
    }[]
  > => {
    const sql = `SELECT cu.room_id as roomId, json_arrayagg(cu2.user_id) as users, h.msg, h.type as chatType, h.create_time as chatTime FROM room_user cu
RIGHT JOIN room_user cu2 ON cu.room_id = cu2.room_id
RIGHT JOIN (SELECT room_id, MAX(chat_id) AS lastChatId FROM chat_history GROUP BY room_id) l ON l.room_id = cu.room_id
LEFT JOIN chat_history h ON h.chat_id = l.lastChatId
WHERE cu.user_id=:userId
GROUP BY cu.room_id
ORDER BY h.create_time DESC
LIMIT :pageOffset, :pageAmount;`

    const pageAmount = 20
    const value = { userId, pageAmount, pageOffset: page * pageAmount }
    const [rows] = await this.db.query(sql, value)

    return rows.map((row) => {
      return {
        roomId: row.roomId,
        users: row.users,
        lastChat: row.msg,
        lastChatType: row.chatType,
        lastChatTime: new Date(row.chatTime),
      }
    })
  }

  saveMsg = async (
    roomId: number,
    userId: number | null,
    type: string,
    msg: string,
    sub: number | null,
  ): Promise<number> => {
    const sql =
      'INSERT INTO chat_history(room_id, user_id, type, msg, sub_data) VALUES(:roomId, :userId, :type, :msg, :sub)'
    const value = { userId, roomId, msg, type, sub }
    const [result] = await this.db.query(sql, value)

    return result['insertId']
  }

  newEstimate = async (
    roomId: number,
    account: string,
    bank: string,
    price: number,
  ): Promise<number> => {
    const sql =
      'INSERT INTO payments(room_id, price, account, bank, status) VALUES(:roomId, :price, :account, :bank, 0)'
    const value = { roomId, account, bank, price }
    const [result] = await this.db.query(sql, value)

    return result['insertId']
  }

  getChatRoomId = async (
    demanderId: number,
    supplierId: number,
  ): Promise<number | null> => {
    const sql = `SELECT d.room_id FROM room_user d
INNER JOIN (SELECT room_id FROM room_user WHERE user_id=:supplierId AND user_type='S') s ON d.room_id = s.room_id
WHERE user_id=:demanderId AND user_type='D'`
    const value = { demanderId, supplierId }
    const [rows] = await this.db.query(sql, value)

    if (rows[0] != null) return rows[0].room_id

    return null
  }

  getChatRoomIdWithEstimate = async (
    estimateId: number,
  ): Promise<{ roomId: number; demanderId: number } | null> => {
    const sql = `SELECT e.room_id as roomId, r.user_id as demanderId FROM payments e 
LEFT JOIN (SELECT room_id, user_id FROM room_user WHERE user_type='D') r on e.room_id = r.room_id 
WHERE payment_id = :estimateId;`
    const value = { estimateId }
    const [rows] = await this.db.query(sql, value)

    if (rows[0] != null) return rows[0]

    return null
  }

  newChatRoom = async (
    demanderId: number,
    supplierId: number,
  ): Promise<number> => {
    const connection = await this.db.beginTransaction()

    try {
      const [result] = await connection.query('INSERT INTO rooms VALUES()')

      const sql = `INSERT INTO room_user(room_id, user_id, user_type) VALUES
    (LAST_INSERT_ID(), :supplierId, 'S'),
    (LAST_INSERT_ID(), :demanderId, 'D');`
      await connection.query(sql, { demanderId, supplierId })

      await connection.commit()

      const roomId = result['insertId'] as number
      return roomId
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getChatProfile = async (userId: number): Promise<ChatUserProfile> => {
    const sql = `SELECT user_id as id, img as profileImg, name FROM users WHERE user_id=:userId`
    const value = { userId }
    const [rows] = await this.db.query(sql, value)

    return rows[0]
  }

  getChatHistory = async (
    roomId: number,
    olderChatId: number | undefined,
  ): Promise<ChatHistoryModel[]> => {
    const sql = `SELECT c.chat_id as chatId, c.user_id as userId, c.type AS chatType, c.msg, c.sub_data as subData, e.price, e.status, cd.coordImgList, c.create_time as createTime FROM chat_history c
LEFT JOIN payments e ON c.sub_data = e.payment_id
LEFT JOIN (
    SELECT coord_id, json_arrayagg(img) as coordImgList FROM coord_clothes group by coord_id
) cd ON cd.coord_id = c.sub_data
WHERE c.room_id = :roomId
${olderChatId != undefined ? 'AND c.chat_id < :olderChatId' : ''}
ORDER BY c.chat_id DESC
LIMIT 50`

    const value = { roomId, olderChatId }
    const [rows] = await this.db.query(sql, value)

    for (const i in rows) {
      rows[i]['createTime'] = new Date(rows[i]['createTime'])
    }

    return rows as ChatHistoryModel[]
  }

  getReadInfo = async (roomId: number): Promise<number[]> => {
    const sql = `SELECT read_id FROM room_user WHERE room_id = :roomId`

    const value = { roomId }
    const [rows] = await this.db.query(sql, value)

    return rows.map((row) => row.read_id)
  }

  getUnreadCount = async (roomId: number, userId: number): Promise<number> => {
    const sql = `SELECT COUNT(*) AS unreadCount FROM room_user u
JOIN chat_history h ON (u.read_id IS NULL OR u.read_id < h.chat_id) AND u.room_id = h.room_id
WHERE u.room_id = :roomId AND u.user_id = :userId;`

    const value = { roomId, userId }
    const [rows] = await this.db.query(sql, value)

    return rows[0].unreadCount
  }

  readMsg = async (roomId: number, userId: number): Promise<void> => {
    const sql = `UPDATE room_user SET read_id = (SELECT max(chat_id) FROM chat_history WHERE room_id = :roomId) WHERE room_id = :roomId AND user_id = :userId;`
    const value = { roomId, userId }

    await this.db.query(sql, value)
  }

  getEstimate = async (estimateId: number): Promise<Payment | null> => {
    const sql = `SELECT payment_id as estimateId, room_id as roomId, price, status FROM payments WHERE payment_id=:estimateId`
    const value = { estimateId }

    const [rows] = await this.db.query(sql, value)

    return rows[0]
  }

  getLatestPayment = async (roomId: number): Promise<Payment | null> => {
    const sql = `SELECT p.payment_id as paymentId, p.price, p.status, c.coord_id AS latestCoordId, p.request_edit AS requestEditCoordId FROM payments p 
LEFT JOIN coords c ON c.payment_id = p.payment_id
WHERE p.room_id=:roomId 
ORDER BY p.payment_id DESC, c.coord_id DESC  
LIMIT 1`
    const value = { roomId }

    const [rows] = await this.db.query(sql, value)

    return rows[0]
  }

  setpaymentstatus = async (
    estimateId: number,
    status: number,
  ): Promise<void> => {
    const sql = `UPDATE payments SET status=:status WHERE payment_id=:estimateId`
    const value = { estimateId, status }

    await this.db.query(sql, value)
  }

  getNotificationData = async (
    userId: number[],
  ): Promise<
    {
      userId: number
      time: Date | null
      phone: string | null
    }[]
  > => {
    const sql = `SELECT user_id as userId, notification_time as time, phone FROM users WHERE user_id IN (:userId)`
    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    return rows as any
  }

  refreshNotificationTime = async (userId: number[]): Promise<void> => {
    const sql = `UPDATE users SET notification_time=NOW() WHERE user_id=:userId`
    const value = { userId }

    await this.db.query(sql, value)
  }
}
