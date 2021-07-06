import fs from 'fs'
import ResourcePath from '../routes/resource/resource-path'

export default class Data {
  static getBodyList(
    gender: string,
  ): { id: number; value: string; img: string } {
    const path =
      gender == 'M'
        ? `${__dirname}\\body\\body-male.json`
        : `${__dirname}\\body\\body-female.json`
    const file = fs.readFileSync(path, 'utf-8')

    const json = JSON.parse(file)

    for (const item of json) {
      item['img'] = ResourcePath.bodyImg(item['id'])
    }

    return json
  }

  static getBodyImg(file: string): Buffer | null {
    try {
      return fs.readFileSync(`${__dirname}\\body\\${file}`)
    } catch (e) {
      return null
    }
  }
}
