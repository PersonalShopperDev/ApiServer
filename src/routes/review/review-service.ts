import ReviewModel from './review-model'
import { ReviewContent } from './review-type'
import S3 from '../../config/s3'

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
      const key = `review/${Date.now()}${index}${userId}${coordId}b`
      keyList.push(key)
      await this.s3.upload(key, file.mimetype, file.buffer)
    }

    await this.model.saveReviewImage(coordId, keyList, 'B')
  }
  saveAfterImage = async (userId, coordId, files) => {
    const keyList: Array<string> = []

    for (const index in files) {
      const file = files[index]
      const key = `review/${Date.now()}${index}${userId}${coordId}a`
      keyList.push(key)
      await this.s3.upload(key, file.mimetype, file.buffer)
    }

    await this.model.saveReviewImage(coordId, keyList, 'A')
  }
}
