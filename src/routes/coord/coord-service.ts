import CoordModel from './coord-model'
import { ImgFile } from '../../types/upload'
import DIContainer from '../../config/inversify.config'
import S3 from '../../config/s3'
import {
  ClothDataWithFile,
  Coord,
  CoordData,
  CoordForSave,
  CoordIdData,
} from './coord-type'
import ResourcePath from '../resource/resource-path'
import ChatModel from '../chat/chat-model'

export default class CoordService {
  model = new CoordModel()
  chatModel = new ChatModel()
  s3 = DIContainer.get(S3)

  getCoord = async (userId: number, coordId: number): Promise<Coord | null> => {
    const base = await this.model.getCoordBase(userId, coordId)

    if (base == null) {
      return null
    }

    const clothes = await this.model.getClothes(coordId)
    const references = await this.model.getReference(coordId)

    for (const c of clothes) {
      c.img = ResourcePath.coordImg(c.img)
    }

    for (const i in references) {
      references[i] = ResourcePath.coordImg(references[i])
    }

    return {
      ...base,
      clothes,
      referenceImgs: references,
    }
  }

  saveImg = async (userId: number, file: ImgFile): Promise<string> => {
    const key = `${Date.now()}${userId}`
    await this.s3.upload(`coord/${key}`, file.mimetype, file.buffer)
    return key
  }

  saveCoord = async (roomId: number, data: Coord): Promise<number | null> => {
    const payment = await this.chatModel.getLatestPayment(roomId)
    if (payment == null) return null

    const coordId = await this.model.createCoord(payment.paymentId, data)

    await this.model.createCloth(coordId, data.clothes)
    await this.model.createReference(coordId, data.referenceImgs)

    return coordId
  }

  requestEditCoord = async (
    coordId: number,
    userId: number,
  ): Promise<number | null> => {
    const ids = await this.model.getIdsByCoordId(coordId, userId)
    if (ids == null) {
      return null
    }
    await this.model.requestEditCoord(ids.paymentId, coordId)

    return ids.roomId
  }

  confirmCoord = async (
    coordId: number,
    userId: number,
  ): Promise<number | null> => {
    const ids = await this.model.getIdsByCoordId(coordId, userId)
    if (ids == null) {
      return null
    }
    await this.model.confirmCoord(ids.paymentId, coordId)

    return ids.roomId
  }
}
