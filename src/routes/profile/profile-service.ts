import { checkProperty, ProfileData, ProfileDataFields } from './profile-type'
import ProfileModel from './profile-model'

export default class ProfileService {
  model = new ProfileModel()

  getOnBoardData = async (
    targetId: number,
    userId: number,
  ): Promise<ProfileData | null> => {
    const result = await this.model.getOnBoardData(targetId)

    if (result == null) return null

    return result
  }

  saveOnBoardData = async (
    userId: number,
    inputData: ProfileData,
  ): Promise<void> => {
    const data = {}

    for (const k of ProfileDataFields) {
      data[k] = inputData[k]
    }

    await this.model.saveBasicUserData(
      userId,
      inputData['gender'],
      inputData['userType'],
    )
    await this.model.saveOnBoardData(userId, data as ProfileData)
  }

  updateOnBoardData = async (
    userId: number,
    data: ProfileData,
  ): Promise<void> => {
    const baseData: ProfileData | null = await this.model.getOnBoardData(userId)

    if (baseData == null) throw Error

    for (const k of ProfileDataFields) {
      if (checkProperty(k, data)) {
        baseData[k] = data[k]
      }
    }

    await this.model.saveOnBoardData(userId, baseData)
  }
}
