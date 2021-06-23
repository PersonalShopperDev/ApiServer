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
export const isOnboardData = (
  object,
): object is OnboardDemander | OnboardSupplier => {
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

export interface OnboardDemander {
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

export interface OnboardSupplier {
  supplyMale: boolean | undefined
  supplyFemale: boolean | undefined
  career: number | undefined
}

export interface OnboardDemanderPut extends OnboardDemander, PutData {}
export interface OnboardDemanderPut extends OnboardSupplier, PutData {}

interface PutData {
  userType: string
  gender: string
}

interface PriceContent {
  min: number
  max: number
}
