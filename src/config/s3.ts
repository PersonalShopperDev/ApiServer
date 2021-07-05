import AWS from 'aws-sdk'
import { injectable } from 'inversify'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { validationResult } from 'express-validator'

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

  upload = async (key, mimetype, buffer) => {
    const params = {
      Bucket: 'personal-shopper-resource',
      Key: key,
      ContentType: mimetype,
      Body: buffer,
      ACL: 'private',
    }

    try {
      await this.s3.upload(params).promise()
    } catch (e) {
      console.log('tt')
      console.log(e)
    }
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

  uploadReview = multer({
    fileFilter: (req, file, cb) => {
      if (validationResult(req).isEmpty()) {
        cb(null, true)
      } else {
        cb(null, false)
      }
    },
    storage: multerS3({
      s3: this.s3,
      bucket: 'personal-shopper-resource',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'private',
      key: function (req, file, cb) {
        const coordId = req.params.id
        let index = 0
        if (req['index'] != null) index = req['index']++
        else req['index'] = 1

        cb(null, `review/${Date.now()}${index}${req['auth'].userId}${coordId}`)
      },
    }),
  })
}
