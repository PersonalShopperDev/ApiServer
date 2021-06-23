import {
  checkProperty,
  OnBoardingData,
  OnBoardingDataFields,
} from './profile-type'
import ProfileModel from './profile-model'

export default class ProfileService {
  model = new ProfileModel()

  getOnBoardData = async (
    targetId: number,
    userId: number,
  ): Promise<OnBoardingData | null> => {
    const result = await this.model.getOnBoardData(targetId)

    if (result == null) return null

    return result
  }

  saveOnBoardData = async (
    userId: number,
    inputData: OnBoardingData,
  ): Promise<void> => {
    const data = {}

    for (const k of OnBoardingDataFields) {
      data[k] = inputData[k]
    }

    await this.model.saveBasicUserData(
      userId,
      inputData['gender'],
      inputData['userType'],
    )
    await this.model.saveOnBoardData(userId, data as OnBoardingData)
  }

  updateOnBoardData = async (
    userId: number,
    data: OnBoardingData,
  ): Promise<void> => {
    const baseData: OnBoardingData | null = await this.model.getOnBoardData(
      userId,
    )

    if (baseData == null) throw Error

    for (const k of OnBoardingDataFields) {
      if (checkProperty(k, data)) {
        baseData[k] = data[k]
      }
    }

    await this.model.saveOnBoardData(userId, baseData)
  }

  getMyProfileStylist = async () => {}
  getMyProfileUser = async () => {}

  patchProfileUser = async (userId: number, data: any) => {
    let { profile }: any = this.model.getUserProfileData(userId)
    const { hopeToStylist, bodyStat } = data

    if (profile == null) {
      profile = { hopeToStylist, bodyStat }
    } else {
      if (hopeToStylist != null) {
        profile['hopeToStylist'] = hopeToStylist
      }
      if (bodyStat == null) {
        profile['bodyStat'] = bodyStat
      }
    }

    await this.model.updateUserBasicData(
      userId,
      data['name'],
      data['introduction'],
      JSON.stringify(profile),
    )
  }
  patchProfileStylist = async (userId: number, data: any) => {
    let { profile }: any = this.model.getUserProfileData(userId)
    const { careerList, price } = data

    if (profile == null) {
      profile = { careerList }
    } else {
      if (careerList != null) {
        profile['careerList'] = careerList
      }
    }
    await this.model.updateUserBasicData(
      userId,
      data['name'],
      data['introduction'],
      JSON.stringify(profile),
    )

    if (price != null) {
      await this.model.updateStylistData(userId, price)
    }
  }
}
