import fs from 'fs'
import ResourcePath from '../routes/resource/resource-path'
import { IdValuePair } from './data-type'

export default class Data {
  private static baseUrl = `${__dirname}/../../data/`

  private static idToGender(id: number): string {
    return id % 10 == 1 ? 'M' : 'F'
  }

  // region Body
  static getBodyList(gender: string): (IdValuePair & { img: string })[] {
    const json = this.getDefaultBodyList(gender)

    for (const item of json) {
      item['img'] = ResourcePath.bodyImg(item['id'])
    }

    return json as { id: number; value: string; img: string }[]
  }

  static getBodyImg(file: string): Buffer | null {
    try {
      return fs.readFileSync(`${this.baseUrl}body/${file}`)
    } catch (e) {
      return null
    }
  }

  static getBodyItem(id: number): IdValuePair {
    const gender = Data.idToGender(id)
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
        ? `${Data.baseUrl}body/body-male.json`
        : `${Data.baseUrl}body/body-female.json`

    const file = fs.readFileSync(path, 'utf-8')

    const json = JSON.parse(file)

    return json
  }

  // endregion

  //  region Style Type
  static getStyleImg(file: string): Buffer | null {
    try {
      return fs.readFileSync(`${this.baseUrl}style/${file}`)
    } catch (e) {
      return null
    }
  }

  static getStyleItemList(id: Array<number>): IdValuePair[] {
    return id.map((item) => {
      return this.getStyleItem(item)
    })
  }

  static getStyleItem(id: number): IdValuePair {
    const gender = Data.idToGender(id)
    const json: IdValuePair[] = this.getStyleList(gender)

    for (const item of json) {
      if (item['id'] === id) {
        return item
      }
    }

    return { id, value: '알수없음' }
  }

  static getStyleList(gender: string): IdValuePair[] {
    const path =
      gender == 'M'
        ? `${Data.baseUrl}style/male.json`
        : `${Data.baseUrl}style/female.json`

    const file = fs.readFileSync(path, 'utf-8')

    return JSON.parse(file)
  }

  static getStyleImgList(gender: string): { id: number; img: string }[] {
    const json = this.getStyleImgListRaw(gender)

    return json.map((item, index) => {
      return { id: item.id, img: ResourcePath.styleImg(item.img) }
    })
  }

  static convertImgToStyle(imgIdList: number[]): number[] {
    const list = [
      ...this.getStyleImgListRaw('F'),
      ...this.getStyleImgListRaw('M'),
    ]

    const result: number[] = []

    for (const data of list) {
      for (const imgId of imgIdList) {
        if (data.id === imgId) result.push(data.style)
      }
    }

    return result
  }

  private static getStyleImgListRaw(
    gender: string,
  ): { id: number; img: string; style: number }[] {
    const path =
      gender == 'M'
        ? `${Data.baseUrl}style/male-img.json`
        : `${Data.baseUrl}style/female-img.json`

    const file = fs.readFileSync(path, 'utf-8')

    return JSON.parse(file)
  }
  // endregion
}
