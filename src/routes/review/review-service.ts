import ReviewModel from './review-model'
import { ReviewContent, ReviewCoord } from './review-type'
import S3 from '../../config/s3'
import StyleModel from '../style/style-model'
import { UserManager } from '../auth/auth-model'
import ResourceModel from '../resource/resource-model'
import ResourcePath from '../resource/resource-path'

export default class ReviewService {
  model = new ReviewModel()
  s3 = new S3()
  isOwnerReview = async (userId: number, coordId: number): Promise<boolean> => {
    const id = await this.model.getCoordinationUserId(coordId)
    console.log(id)
    return id != null && userId == id
  }

  saveReview = async (coordId: number, data: ReviewContent): Promise<void> => {
    await this.model.saveReview(coordId, data)
  }

  saveBeforeImage = async (userId, coordId, files) => {
    const keyList: Array<string> = []

    for (const index in files) {
      const file = files[index]
      const key = `${Date.now()}${index}${userId}${coordId}b`
      keyList.push(key)
      await this.s3.upload(`review/${key}`, file.mimetype, file.buffer)
    }

    await this.model.saveReviewImage(coordId, keyList, 'B')
  }

  saveAfterImage = async (userId, coordId, files) => {
    const keyList: Array<string> = []

    for (const index in files) {
      const file = files[index]
      const key = `${Date.now()}${index}${userId}${coordId}a`
      keyList.push(key)
      await this.s3.upload(`review/${key}`, file.mimetype, file.buffer)
    }

    await this.model.saveReviewImage(coordId, keyList, 'A')
  }

  getCoordInfo = async (coordId: number): Promise<ReviewCoord> => {
    const { id, name, profile, img, type } = await this.model.getCoordInfo(
      coordId,
    )

    return {
      supplierId: id,
      profile: ResourcePath.profileImg(profile),
      img: ResourcePath.coordImg(img),
      title: `${name} 스타일리스트의 코디`,
      styleTypeList: StyleModel.getStyleTypeList(type),
    }
  }
}
