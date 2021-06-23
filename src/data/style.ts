import * as fs from 'fs'

export const getStyleTypeList = (M: boolean, F: boolean) => {
  const result = {}

  if (M) {
    result['male'] = male.map((item) => {
      const { id, value } = item
      return { id, value }
    })
  }

  if (F) {
    result['female'] = female.map((item) => {
      const { id, value } = item
      return { id, value }
    })
  }

  return result
}

export const getStyleImgList = (gender: string) => {
  const list = gender == 'M' ? male : female
  return list.map((item) => {
    const { id, img } = item
    return { id, img }
  })
}

const male = [
  {
    id: 11,
    value: '캐주얼',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },

  {
    id: 21,
    value: '빈티지',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },
  {
    id: 31,
    value: '모던',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },
  {
    id: 41,
    value: '댄디',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },
  {
    id: 51,
    value: '미니멀',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },
  {
    id: 61,
    value: '워크웨어',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },
  {
    id: 71,
    value: '그런지',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },
  {
    id: 81,
    value: '아메카지',
    img: `${process.env.DOMAIN}v1/resource/style/a.png`,
  },
]

const female = [
  {
    id: 12,
    value: '캐주얼',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },

  {
    id: 22,
    value: '모던',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 32,
    value: '스트릿',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 42,
    value: '페미닌',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 52,
    value: '러블리',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 62,
    value: '빈티지',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 72,
    value: '스쿨룩',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 82,
    value: '심플베이직',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 92,
    value: '오피스룩',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 102,
    value: '에스닉',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 112,
    value: '유니크',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 122,
    value: '섹시글램',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 132,
    value: '히피',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
  {
    id: 142,
    value: '보고',
    img: `${process.env.DOMAIN}v1/resource/style/b.png`,
  },
]
