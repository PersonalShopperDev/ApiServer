import db from '../../config/db'
import { RowDataPacket } from 'mysql2'
import { ChatHistoryModel, ChatRoomData, ChatUserProfile } from './chat-type'

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
      const sql = `SELECT demander_id, supplier_id FROM chat_rooms WHERE chat_room_id=:roomId;`

      const value = { roomId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      const row = rows[0]

      return {
        roomId,
        users: [row.supplier_id, row.demander_id],
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
      const sql = `SELECT chat_room_id as roomId, demander_id, supplier_id FROM chat_rooms
WHERE supplier_id=:userId or demander_id=:userId;`

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
      lastChatTime: Date
    }[]
  > => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT r.chat_room_id as roomId, r.demander_id, r.supplier_id, h.msg, h.create_time FROM chat_rooms r 
RIGHT JOIN (SELECT chat_room_id, MAX(chat_id) AS lastChatId FROM chat_history GROUP BY chat_room_id) l ON l.chat_room_id = r.chat_room_id
LEFT JOIN chat_history h ON h.chat_id = l.lastChatId 
WHERE r.supplier_id=:userId OR r.demander_id=:userId
ORDER BY h.create_time DESC
LIMIT :pageOffset, :pageAmount;`

      const pageAmount = 20
      const value = { userId, pageAmount, pageOffset: page * pageAmount }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => {
        return {
          roomId: row.roomId,
          users: [row.supplier_id, row.demander_id],
          lastChat: row.msg,
          lastChatTime: new Date(row.create_time),
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
    userId: number,
    type: number,
    msg: string,
    sub: number | null,
  ): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO chat_history(chat_room_id, user_id, type, msg, subData) VALUES(:roomId, :userId, :type, :msg, :sub)'
      const value = { userId, roomId, msg, type, sub }
      const [result] = await connection.query(sql, value)

      return result['insertId']
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveEstimate = async (
    roomId: number,
    account: string,
    bank: string,
    price: number,
  ): Promise<number> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO estimates(chat_room_id, price, account, bank, status) VALUES(:roomId, :price, :account, :bank, 0)'
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
      const sql = `SELECT chat_room_id FROM chat_rooms WHERE (demander_id=:demanderId AND supplier_id=:supplierId) OR (demander_id=:supplierId AND supplier_id=:demanderId);`
      const value = { demanderId, supplierId }
      const [rows] = await connection.query(sql, value)

      if (rows[0] != null) return rows[0].chat_room_id

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
      const sql = `INSERT INTO chat_rooms(demander_id, supplier_id) VALUES(:demanderId, :supplierId);`
      const value = { demanderId, supplierId }
      const [result] = await connection.query(sql, value)
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
      const sql = `SELECT c.chat_id as chatId, c.user_id as userId, c.type, c.msg, e.price, c.create_time as createTime FROM chat_history c
LEFT JOIN estimates e ON c.subData = e.estimate_id
WHERE c.chat_room_id = :roomId 
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
}
