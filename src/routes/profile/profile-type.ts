export const ProfileDataFields = [
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
]

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isProfileData = (object): object is ProfileData => {
  let key: string
  for (key of ProfileDataFields) {
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

export type ProfileData = {
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

interface PriceContent {
  min: number
  max: number
}
