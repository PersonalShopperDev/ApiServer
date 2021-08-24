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

  newCoord = async (
    demanderId: number,
    supplierId: number,
    title: string,
    comment: string,
  ): Promise<CoordIdData | null> => {
    const data = await this.model.findEstimate(demanderId, supplierId)

    if (data == null) return null

    data.coordId = await this.model.newCoord(data.estimateId, title, comment)
    return data
  }

  saveMainImg = async (coorId: number, file: ImgFile): Promise<string> => {
    const key = `${Date.now()}0${coorId}`

    await this.s3.upload(`coord/${key}`, file.mimetype, file.buffer)
    await this.model.updateCoordImg(coorId, key)

    return key
  }

  addCloth = async (
    coorId: number,
    userId: number,
    cloth: ClothDataWithFile,
  ): Promise<boolean> => {
    const clothNum = await this.model.checkCoordId(coorId, userId)

    if (clothNum == null) {
      // 권한 없음
      return false
    }
    const { name, img, price, purchaseUrl } = cloth

    const file = img
    const key = `${Date.now()}${clothNum}${coorId}`
    await this.s3.upload(`coord/${key}`, file.mimetype, file.buffer)

    await this.model.insertCloth(coorId, {
      name,
      price,
      purchaseUrl,
      img: key,
    })

    return true
  }

  saveImg = async (userId: number, file: ImgFile): Promise<string> => {
    const key = `${Date.now()}${userId}`
    await this.s3.upload(`coord/${key}`, file.mimetype, file.buffer)
    return key
  }

  saveCoord = async (roomId: number, data: Coord): Promise<boolean> => {
    const payment = await this.chatModel.getLatestPayment(roomId)
    if (payment == null) return false

    const coordId = await this.model.createCoord(payment.paymentId, data)

    await this.model.createCloth(coordId, data.clothes)
    await this.model.createReference(coordId, data.referenceImgs)

    return true
  }
}
