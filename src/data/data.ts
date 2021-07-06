import fs from 'fs'
import ResourcePath from '../routes/resource/resource-path'
import { IdValuePair } from './data-type'

export default class Data {
  static getBodyList(gender: string): (IdValuePair & { img: string })[] {
    const json = this.getDefaultBodyList(gender)

    for (const item of json) {
      item['img'] = ResourcePath.bodyImg(item['id'])
    }

    return json as { id: number; value: string; img: string }[]
  }

  static getBodyImg(file: string): Buffer | null {
    try {
      return fs.readFileSync(`${__dirname}\\body\\${file}`)
    } catch (e) {
      return null
    }
  }

  static getBodyItem(id: number): IdValuePair {
    const gender = id % 10 == 1 ? 'M' : 'F'
    const json: IdValuePair[] = this.getDefaultBodyList(gender)

    for (const item of json) {
      if (item['id'] === id) {
        return item
      }
    }

    return { id, value: '알수없음' } // TODO: 데이터 없을 때 예외 처리
  }

  private static getDefaultBodyList(gender: string): IdValuePair[] {
    const path =
      gender == 'M'
        ? `${__dirname}\\body\\body-male.json`
        : `${__dirname}\\body\\body-female.json`
    const file = fs.readFileSync(path, 'utf-8')

    const json = JSON.parse(file)

    return json
  }
}
