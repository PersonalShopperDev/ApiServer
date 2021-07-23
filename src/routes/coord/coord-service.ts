import CoordModel from './coord-model'
import { ImgFile } from '../../types/upload'
import DIContainer from '../../config/inversify.config'
import S3 from '../../config/s3'
import { ClothData, CoordData } from './coord-type'
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

    if (estimate == null) return null

    return await this.model.newCoord(estimate, title, comment)
  }

  saveMainImg = async (coorId: number, file: ImgFile): Promise<void> => {
    const key = `${Date.now()}0${coorId}`

    await this.s3.upload(`coord/${key}`, file.mimetype, file.buffer)
    await this.model.updateCoordImg(coorId, key)
  }

  saveClothImg = async (
    coorId: number,
    imgList: ImgFile[],
    nameList: string[],
    price: number[],
    purchaseUrl: string[],
  ): Promise<void> => {
    const dataList: ClothData[] = []

    for (const index in imgList) {
      const file = imgList[index]
      const key = `${Date.now()}${Number(index) + 1}${coorId}`
      await this.s3.upload(`coord/${key}`, file.mimetype, file.buffer)

      dataList.push({
        name: nameList[index],
        price: price[index],
        purchaseUrl: purchaseUrl[index],
        img: key,
      })
    }

    await this.model.insertCloth(coorId, dataList)
  }
}
