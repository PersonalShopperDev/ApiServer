import { Banner } from '../home/home-type'
import db from '../../config/db'
import { RowDataPacket } from 'mysql2'

export default class ChatModel {
  getChatRooms = async (userId: number): Promise<Array<number>> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'SELECT chat_id as chatId FROM chat_user WHERE user_id = :userId'
      const value = { userId }
      const [rows] = (await connection.query(sql, value)) as RowDataPacket[]

      return rows.map((row) => row.chatId)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }

  saveMsg = async (
    chatId: number,
    userId: number,
    msg: string,
  ): Promise<void> => {
    const connection = await db.getConnection()
    try {
      const sql =
        'INSERT INTO chat_history(chat_id,user_id,msg) VALUES(:chatId, :userId, :msg)'
      const value = { userId, chatId, msg }
      await connection.query(sql, value)
    } catch (e) {
      throw e
    } finally {
      connection.release()
    }
  }
}
