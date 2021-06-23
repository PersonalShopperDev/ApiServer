import DIContainer from '../../config/inversify.config'
import ResourceModel, { Resource } from './resource-model'

export default class ResourceService {
  model = DIContainer.resolve(ResourceModel)

  getProfileImg = async (id): Promise<Resource | null> => {
    const baseKey = 'user/profile-img/'

    return await this.model.getResourceFromS3(`${baseKey}${id}`)
  }

  getBannerImg = async (id): Promise<Resource | null> => {
    const baseKey = 'banner/'

    return await this.model.getResourceFromS3(`${baseKey}${id}`)
  }

  getStyle = async (id): Promise<Resource | null> => {
    const baseKey = 'style/'

    return await this.model.getResourceFromS3(`${baseKey}${id}`)
  }
}
