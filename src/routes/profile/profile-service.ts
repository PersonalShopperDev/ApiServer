import ProfileModel from './profile-model'
import {
  ProfileDemanderPatch,
  ProfileSupplierPatch,
  ProfileUser,
} from './profile-type'

export default class ProfileService {
  model = new ProfileModel()

  getMyProfileStylist = async () => {}
  getMyProfileUser = async () => {}

  patchDemander = async (
    userId: number,
    data: ProfileUser & ProfileDemanderPatch,
  ) => {
    const baseData = this.model.getBasicProfile(userId)
    const { hopeToSupplier, bodyStat } = data
    let patchData = {} as ProfileDemanderPatch

    if (baseData == null) {
      patchData = { hopeToSupplier, bodyStat }
    } else {
      if (hopeToSupplier != null) {
        patchData['hopeToStylist'] = hopeToSupplier
      }
      if (bodyStat == null) {
        patchData['bodyStat'] = bodyStat
      }
    }

    await this.model.saveProfile(
      userId,
      data['name'],
      data['introduction'],
      JSON.stringify(patchData),
    )
  }

  patchSupplier = async (
    userId: number,
    data: ProfileUser & ProfileSupplierPatch,
  ) => {
    let { profile }: any = this.model.getBasicProfile(userId)
    const { careerList, price } = data

    if (profile == null) {
      profile = { careerList }
    } else {
      if (careerList != null) {
        profile['careerList'] = careerList
      }
    }
    await this.model.saveProfile(
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
