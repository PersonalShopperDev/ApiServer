import env from 'dotenv'
import chai, { assert } from 'chai'
import mocha from 'mocha'
import * as sinon from 'sinon'
import jwt from 'jsonwebtoken'
import { TokenManager, UserManager } from '../src/routes/auth/auth-model'
import AuthService from '../src/routes/auth/auth-service'
import DIContainer from '../src/config/inversify.config'

describe('Auth', () => {
  before(() => {
    env.config()
  })
  describe('Auth Model Test', () => {
    it('generate JWT', () => {
      const userId = 1
      const token = TokenManager.generateAccessToken(userId)

      const verify = jwt.verify(token, process.env.JWT_KEY)
      assert.include(verify, { userId })
    })
  })

  describe('Get New Token Test', () => {
    let checkRefreshTokenStub, saveRefreshTokenStub
    before(() => {
      checkRefreshTokenStub = sinon.stub(TokenManager, 'checkRefreshToken')

      const longExpire = new Date()
      longExpire.setMonth(longExpire.getMonth() + 3)
      const shortExpire = new Date()
      shortExpire.setDate(shortExpire.getDate() + 2)
      const expired = new Date()
      expired.setMinutes(expired.getMinutes() - 1)

      checkRefreshTokenStub
        .withArgs('refreshValid')
        .resolves({ userId: 1, expire: longExpire })
        .withArgs('refreshShortValid')
        .resolves({ userId: 2, expire: shortExpire })
        .withArgs('refreshExpired')
        .resolves({ userId: 3, expire: expired })
      checkRefreshTokenStub.resolves(null)

      saveRefreshTokenStub = sinon.stub(TokenManager, 'saveRefreshToken')
      saveRefreshTokenStub.resolves(true)
    })

    after(() => {
      checkRefreshTokenStub.restore()
      saveRefreshTokenStub.restore()
    })

    it('RefreshToken is invalid', async () => {
      const service = new AuthService()
      const result = await service.newTokenWithRefreshToken('asdf')

      assert.isNull(result)
    })

    it('RefreshToken is expired', async () => {
      const service = new AuthService()
      const result = await service.newTokenWithRefreshToken('refreshExpired')

      assert.isNull(result)
    })

    it('RefreshToken is valid - long expire date', async () => {
      const service = new AuthService()
      const result = await service.newTokenWithRefreshToken('refreshValid')

      assert.containsAllKeys(result, ['accessToken'])
      assert.isUndefined(result?.refreshToken)

      const accessToken = result?.accessToken
      const payload = jwt.verify(accessToken, process.env.JWT_KEY)

      assert.equal(payload.userId, 1)
    })

    it('RefreshToken is valid - short expire date', async () => {
      const service = new AuthService()
      const result = await service.newTokenWithRefreshToken('refreshShortValid')

      assert.hasAllKeys(result, ['accessToken', 'refreshToken'])
      assert.isString(result?.accessToken)
      assert.isString(result?.refreshToken)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      assert.lengthOf(result!.refreshToken!, 512)

      const accessToken = result?.accessToken
      const payload = jwt.verify(accessToken, process.env.JWT_KEY)

      assert.equal(payload.userId, 2)
    })
  })

  describe('Withdraw Test', () => {
    let deleteFunc
    before(() => {
      deleteFunc = sinon.stub(UserManager, 'deleteUser')
      deleteFunc.withArgs(0).resolves(false)
      deleteFunc.withArgs(1).resolves(true)
    })
    after(() => {
      deleteFunc.restore()
    })
    it('withdraw - not exist user', async () => {
      const service = new AuthService()
      const result = await service.withdraw(0)
      assert.isFalse(result)
    })
    it('withdraw - exist user', async () => {
      const service = new AuthService()
      const result = await service.withdraw(1)
      assert.isTrue(result)
    })
  })
})
