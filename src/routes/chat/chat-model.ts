import db from '../../config/db'
import { RowDataPacket } from 'mysql2'
import { ChatRoomData } from './chat-type'

export default class ChatModel {
  getChatRooms = async (userId: number): Promise<ChatRoomData[]> => {
    const connection = await db.getConnection()
    try {
      const sql = `SELECT a.chat_room_id as roomId, users FROM chat_user a
LEFT JOIN (
    SELECT chat_room_id, json_arrayagg(user_id) as users FROM chat_user GROUP BY chat_room_id
) b ON a.chat_room_id = b.chat_room_id
WHERE user_id = :userId;`

      const value = { userId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows as ChatRoomData[]
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
    sub: string | null,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO chat_history(chat_room_id, user_id, type, msg, subData) VALUES(:roomId, :userId, :type, :msg, :sub)'
      const value = { userId, roomId, msg, type, sub }
      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  newChatRooms = async (userId: number, targetId: number): Promise<number> => {
    const connection = await db.getConnection()
    try {
      let sql = `INSERT INTO chat_rooms VALUES();`

      const [result] = await connection.query(sql)
      const roomId = result['insertId'] as number

      sql = 'INSERT INTO chat_user(chat_room_id, user_id) VALUES :value'
      const value = [
        [roomId, userId],
        [roomId, targetId],
      ]

      await connection.query(sql, { value })

      return roomId
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
