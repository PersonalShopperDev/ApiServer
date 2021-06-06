import { inject, injectable } from 'inversify'
import S3 from '../../config/s3'
import { Body } from 'aws-sdk/clients/s3'

export interface Resource {
  contentType: string
  data: Body | undefined
}

@injectable()
export default class ResourceModel {
  private s3: S3

  constructor(@inject(S3) s3: S3) {
    this.s3 = s3
  }

  getResourceFromS3 = async (key): Promise<Resource | null> => {
    try {
      const result = await this.s3.download(key)
      const contentType = result.ContentType!.toString()

      return {
        contentType,
        data: result.Body,
      }
    } catch (e) {}
    return null
  }
}
