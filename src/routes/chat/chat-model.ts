import db from '../../config/db'
import { RowDataPacket } from 'mysql2'
import {
  ChatHistoryModel,
  ChatRoomData,
  ChatUserProfile,
  Estimate,
} from './chat-type'

export default class ChatModel {
  checkSupplier = async (supplierId: number): Promise<boolean> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT user_id FROM suppliers WHERE user_id=:supplierId`

      const value = { supplierId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows[0] != null
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getChatRoom = async (roomId: number): Promise<ChatRoomData> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT user_id FROM room_user WHERE room_id=:roomId;`

      const value = { roomId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return {
        roomId,
        users: rows.map((row) => row.user_id),
      }
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getChatRooms = async (userId: number): Promise<ChatRoomData[]> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT a.room_id as roomId, json_arrayagg(b.user_id) AS users FROM room_user a
RIGHT JOIN room_user b ON a.room_id = b.room_id
WHERE a.user_id = :userId
GROUP BY a.room_id;`

      const value = { userId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          roomId: row.roomId,
          users: [row.supplier_id, row.demander_id],
        }
      })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getChatRoomsWithLastChat = async (
    userId: number,
    page: number,
  ): Promise<
    {
      roomId: number
      users: Array<number>
      lastChat: string
      lastChatType: number
      lastChatTime: Date
    }[]
  > => {
    const connection = await db.getConnection()
    try {
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
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          roomId: row.roomId,
          users: row.users,
          lastChat: row.msg,
          lastChatType: row.chatType,
          lastChatTime: new Date(row.chatTime),
        }
      })
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveMsg = async (
    roomId: number,
    userId: number | null,
    type: number,
    msg: string,
    sub: number | null,
  ): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO chat_history(room_id, user_id, type, msg, sub_data) VALUES(:roomId, :userId, :type, :msg, :sub)'
      const value = { userId, roomId, msg, type, sub }
      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  newEstimate = async (
    roomId: number,
    account: string,
    bank: string,
    price: number,
  ): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO estimates(room_id, price, account, bank, status) VALUES(:roomId, :price, :account, :bank, 0)'
      const value = { roomId, account, bank, price }
      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getChatRoomId = async (
    demanderId: number,
    supplierId: number,
  ): Promise<number | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT d.room_id FROM room_user d
INNER JOIN (SELECT room_id FROM room_user WHERE user_id=:supplierId AND user_type='S') s ON d.room_id = s.room_id
WHERE user_id=:demanderId AND user_type='D'`
      const value = { demanderId, supplierId }
      const [rows] = await connection.query(sql, value)

      if (rows[0] != null) return rows[0].room_id

      return null
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getChatRoomIdWithEstimate = async (
    estimateId: number,
  ): Promise<{ roomId: number; demanderId: number } | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT e.room_id as roomId, r.user_id as demanderId FROM estimates e 
LEFT JOIN (SELECT room_id, user_id FROM room_user WHERE user_type='D') r on e.room_id = r.room_id 
WHERE estimate_id = :estimateId;`
      const value = { estimateId }
      const [rows] = await connection.query(sql, value)

      if (rows[0] != null) return rows[0]

      return null
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  newChatRoom = async (
    demanderId: number,
    supplierId: number,
  ): Promise<number> => {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

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
    const connection = await db.getConnection()
    try {
      const sql = `SELECT user_id as id, img as profileImg, name FROM users WHERE user_id=:userId`
      const value = { userId }
      const [rows] = await connection.query(sql, value)

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getChatHistory = async (
    roomId: number,
    olderChatId: number | undefined,
  ): Promise<ChatHistoryModel[]> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT c.chat_id as chatId, c.user_id as userId, c.type, c.msg, c.sub_data as subData, e.price, e.status, cd.title as coordTitle, cd.img as coordImg, c.create_time as createTime FROM chat_history c
LEFT JOIN estimates e ON c.sub_data = e.estimate_id
LEFT JOIN coords cd ON cd.coord_id = c.sub_data
WHERE c.room_id = :roomId 
${olderChatId != undefined ? 'AND c.chat_id < :olderChatId' : ''}
ORDER BY c.chat_id DESC
LIMIT 50`

      const value = { roomId, olderChatId }
      const [rows] = await connection.query(sql, value)

      for (const i in rows) {
        rows[i]['createTime'] = new Date(rows[i]['createTime'])
      }

      return rows as ChatHistoryModel[]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getReadInfo = async (roomId: number): Promise<number[]> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT read_id FROM room_user WHERE room_id = :roomId`

      const value = { roomId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => row.read_id)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getUnreadCount = async (roomId: number, userId: number): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT COUNT(*) AS unreadCount FROM room_user u
JOIN chat_history h ON (u.read_id IS NULL OR u.read_id < h.chat_id) AND u.room_id = h.room_id
WHERE u.room_id = :roomId AND u.user_id = :userId;`

      const value = { roomId, userId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows[0].unreadCount
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  readMsg = async (roomId: number, userId: number): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE room_user SET read_id = (SELECT max(chat_id) FROM chat_history WHERE room_id = :roomId) WHERE room_id = :roomId AND user_id = :userId;`
      const value = { roomId, userId }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getEstimate = async (estimateId: number): Promise<Estimate | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT estimate_id as estimateId, room_id as roomId, price, status FROM estimates WHERE estimate_id=:estimateId`
      const value = { estimateId }

      const [rows] = await connection.query(sql, value)

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  getLatestEstimate = async (roomId: number): Promise<Estimate | null> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT estimate_id as estimateId, price, status FROM estimates WHERE room_id=:roomId`
      const value = { roomId }

      const [rows] = await connection.query(sql, value)

      return rows[0]
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  setEstimateStatus = async (
    estimateId: number,
    status: number,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql = `UPDATE estimates SET status=:status WHERE estimate_id=:estimateId`
      const value = { estimateId, status }

      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
