import { injectable, inject } from 'inversify'
import 'reflect-metadata'
export default interface AuthThirdParty {
  verifyCode(code: string): boolean
}

@injectable()
export class NaverAuth implements AuthThirdParty {
  verifyCode(code: string): boolean {
    return false
  }
}

@injectable()
export class KaKaoAuth implements AuthThirdParty {
  verifyCode(code: string): boolean {
    return false
  }
}

export const createRefreshToken = (userId: number) => {
  // TODO: Refresh 토큰 생성 및 DB 저장
  return 'AASD'
}
