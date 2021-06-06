import AWS from 'aws-sdk'
import { injectable } from 'inversify'

@injectable()
export default class S3 {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

  download = async (key) => {
    const params = {
      Bucket: 'personal-shopper-resource',
      Key: key,
    }

    return await this.s3.getObject(params).promise()
  }
}
