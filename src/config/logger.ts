import winston from 'winston'
import { S3StreamLogger } from 's3-streamlogger'
import morgan from 'morgan'

// const transport = new winston.transports.DailyRotateFile({
//   filename: `test.log`,
//   maxsize: 1024,
//   datePatten: 'YYYY-MM-DD-HH',
// })

const s3Stream = new S3StreamLogger({
  bucket: 'ps-api-server-log', // 로그가 기록될 버킷
  // folder: '', // 버킷 내 특정 폴더에 저장.
  // tags: {
  //   type: 'log',
  //   project: 'xxx',
  // }, // 태그
  name_format: '%Y-%m-%d-%H',
  access_key_id: process.env.AWS_ACCESS_KEY,
  secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
})

const transport = new winston.transports.Stream({
  stream: s3Stream,
})

transport.on('error', function (err) {
  console.log(`Error ${err}`)
})

const logger = winston.createLogger({
  transports:
    process.env.NODE_MODE == 'production'
      ? [transport]
      : new winston.transports.Console(),
})

const stream = {
  write: logger.info.bind(logger),
}

morgan.token('user-id', (req, res) => {
  return req['auth']?.userId ?? '-'
})
morgan.token('user-type', (req, res) => {
  return req['auth']?.userType ?? '-'
})

const logModule = morgan(
  ':date[iso]|:user-id|:user-type|:method :http-version :url|:status|:remote-addr|:referrer|:user-agent',
  { stream },
)

export { logModule, logger }
