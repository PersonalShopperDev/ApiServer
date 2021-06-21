import { checkProperty, ProfileData, ProfileDataFields } from './profile-type'
import ProfileModel from './profile-model'

export default class ProfileService {
  model = new ProfileModel()

  saveOnBoardData = async (
    userId: number,
    inputData: ProfileData,
  ): Promise<void> => {
    const data = {}

    for (const k in ProfileDataFields) {
      data[k] = inputData[k]
    }

    await this.model.saveOnBoardData(userId, data as ProfileData)
  }

  updateOnBoardData = async (
    userId: number,
    data: ProfileData,
  ): Promise<void> => {
    const baseData = await this.model.getOnBoardData(userId)

    for (const k of ProfileDataFields) {
      if (checkProperty(k, data)) {
        baseData[k] = data[k]
      }
    }

    await this.model.saveOnBoardData(userId, baseData)
  }
}