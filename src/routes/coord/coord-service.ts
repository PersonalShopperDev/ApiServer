import CoordModel from './coord-model'
import { ImgFile } from '../../types/upload'
import DIContainer from '../../config/inversify.config'
import S3 from '../../config/s3'
import { ClothDataWithFile, CoordData } from './coord-type'
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
  ): Promise<number | null> => {
    const estimate = await this.model.findEstimate(demanderId, supplierId)

    if (estimate == null || estimate.status < 3)
      // TODO: 견적서 상태에 따라 에러 처리
      return null

    return await this.model.newCoord(estimate.estimateId, title, comment)
  }

  saveMainImg = async (coorId: number, file: ImgFile): Promise<void> => {
    const key = `${Date.now()}0${coorId}`

    await this.s3.upload(`coord/${key}`, file.mimetype, file.buffer)
    await this.model.updateCoordImg(coorId, key)
  }

  addCloth = async (
    coorId: number,
    userId: number,
    cloth: ClothDataWithFile,
  ): Promise<void | null> => {
    const clothNum = await this.model.checkCoordId(coorId, userId)

    if (clothNum == null) {
      // 권한 없음
      return null
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
  }
}
