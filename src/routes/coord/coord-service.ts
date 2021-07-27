import CoordModel from './coord-model'
import { ImgFile } from '../../types/upload'
import DIContainer from '../../config/inversify.config'
import S3 from '../../config/s3'
import { ClothDataWithFile, CoordData, CoordIdData } from './coord-type'
import ResourcePath from '../resource/resource-path'

export default class CoordService {
  model = new CoordModel()
  s3 = DIContainer.get(S3)

  getCoord = async (
    userId: number,
    coordId: number,
  ): Promise<CoordData | null> => {
    const base = await this.model.getCoordBase(userId, coordId)

    if (base == null) {
      return null
    }

    const clothes = await this.model.getClothes(coordId)

    for (const c of clothes) {
      c.img = ResourcePath.coordImg(c.img)
    }
    base.mainImg = ResourcePath.coordImg(base.mainImg)

    return {
      ...base,
      clothes,
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

  setPayer = async (
    userId: number,
    estimateId: number,
    name: string,
  ): Promise<boolean> => {
    const clothNum = await this.model.checkEstiamte(userId, estimateId)

    if (clothNum == null) {
      // 권한 없음
      return false
    }

    await this.model.setPayer(estimateId, name)

    return true
  }
}
