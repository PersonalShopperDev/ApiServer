import AWS from 'aws-sdk'
import { injectable } from 'inversify'
import multer from 'multer'
import multerS3 from 'multer-s3'

@injectable()
export default class S3 {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

  download = async (key: string) => {
    const params = {
      Bucket: 'personal-shopper-resource',
      Key: key,
    }

    return await this.s3.getObject(params).promise()
  }

  copy = async (oldKey: string, newKey: string) => {
    const bucket = 'personal-shopper-resource'
    const params = {
      Bucket: bucket /* Another bucket working fine */,
      CopySource: `${bucket}/${oldKey}` /* required */,
      Key: newKey /* required */,
      ACL: 'private',
    }
    await this.s3.copyObject(params).promise()
  }

  uploadProfile = multer({
    storage: multerS3({
      s3: this.s3,
      bucket: 'personal-shopper-resource',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'private',
      key: function (req, file, cb) {
        cb(null, `profile/${Date.now()}${req['auth'].userId}`)
      },
    }),
  })

  uploadCloset = multer({
    storage: multerS3({
      s3: this.s3,
      bucket: 'personal-shopper-resource',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'private',
      key: function (req, file, cb) {
        cb(null, `closet/${Date.now()}${req['auth'].userId}`)
      },
    }),
  })

  uploadLookbook = multer({
    storage: multerS3({
      s3: this.s3,
      bucket: 'personal-shopper-resource',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'private',
      key: function (req, file, cb) {
        cb(null, `lookbook/${Date.now()}${req['auth'].userId}`)
      },
    }),
  })
}
