export const OnBoardingDataFields = [
  'body',
  'skin',
  'topSize',
  'bottomSize',
  'shoulderSize',
  'waistSize',
  'bellySize',
  'hipSize',
  'topPrice',
  'bottomPrice',
  'dressPrice',
  'shoesPrice',
  'bagPrice',
  'accessoryPrice',
  'supplyMale',
  'supplyFemale',
  'career',
]

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isOnBoardingData = (object): object is OnBoardingData => {
  let key: string
  for (key of OnBoardingDataFields) {
    if (!checkProperty(key, object)) {
      return false
    }
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const checkProperty = (key: string, object): boolean => {
  if (!(key in object)) {
    return false
  }
  if (key.includes('Price')) {
    const item = object[key]
    if (!('max' in item && 'min' in item)) {
      return false
    }
  }
  return true
}

export type OnBoardingData = {
  body: number | undefined
  skin: number | undefined
  topSize: number | undefined
  bottomSize: number | undefined
  shoulderSize: number | undefined
  waistSize: number | undefined
  bellySize: number | undefined
  hipSize: number | undefined
  topPrice: PriceContent | undefined
  bottomPrice: PriceContent | undefined
  dressPrice: PriceContent | undefined
  shoesPrice: PriceContent | undefined
  bagPrice: PriceContent | undefined
  accessoryPrice: PriceContent | undefined
}

export type OnBoardingDataStylist = {
  supplyMale: boolean | undefined
  supplyFemale: boolean | undefined
  career: number | undefined
}

interface PriceContent {
  min: number
  max: number
}

export interface MyProfile {
  userType: string
  styles: number[] | undefined
  name: string | undefined
  introduction: string | undefined
}

export interface MyProfileStylist extends MyProfile {
  price: number | undefined
  careerList: Career[] | undefined
  coord: string[] | undefined
}

export interface MyProfileUser extends MyProfile {
  hopeToStylist: string | undefined
  bodyStat: BodyStat | undefined
  closet: string[] | undefined
  review: Review[] | undefined
}

interface BodyStat {
  isPublic: boolean
  height: number
  weight: number
}

interface Career {
  type: number
  value: string
}

interface Review {
  id: number
  img: string
  status: number
}
