import CoordModel from './coord-model'
import { ImgFile } from '../../types/upload'
import DIContainer from '../../config/inversify.config'
import S3 from '../../config/s3'
import { ClothData } from './coord-type'

export default class CoordService {
  model = new CoordModel()
  s3 = DIContainer.get(S3)

  newCoord = async (
    demanderId: number,
    supplierId: number,
    comment: string,
  ): Promise<number | null> => {
    const roomId = await this.model.findRoom(demanderId, supplierId)

    if (roomId == null) return null

    return await this.model.newCoord(roomId, comment)
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
