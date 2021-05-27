import env from 'dotenv'
import chai, { assert } from 'chai'
import mocha from 'mocha'
import * as sinon from 'sinon'
import HomeService from '../src/routes/home/home-service'
import { Banner } from '../src/routes/home/home-type'

const regexUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

describe('Home', () => {
  before(() => {
    env.config()
  })

  describe('Banner Test', () => {
    it('Get Banner List - Success', async () => {
      const service = new HomeService()
      const banners = await service.getBanners()

      assert.isArray(banners)

      for (const banner in banners) {
        assert.containsAllKeys(banner, ['img'])
        assert.match(banner['img'], regexUrl)
      }
    })
  })

  describe('Stylist Test', () => {
    it('Get Stylist List - Success', async () => {
      const service = new HomeService()
      const banners = await service.getStylists()

      assert.isArray(banners)

      for (const banner in banners) {
        assert.containsAllKeys(banner, ['img'])
        assert.match(banner['img'], regexUrl)
      }
    })
  })

  describe('Review Test', () => {
    it('Get Review List - Success', async () => {
      const service = new HomeService()
      const banners = await service.getReviews()

      assert.isArray(banners)

      for (const banner in banners) {
        assert.containsAllKeys(banner, ['beforeImg', 'afterImg'])
        assert.match(banner['beforeImg'], regexUrl)
        assert.match(banner['afterImg'], regexUrl)
      }
    })
  })
})
