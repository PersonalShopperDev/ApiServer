export default class ResourcePath {
  private static baseURL = `${process.env.DOMAIN}v1/resource/`

  static profileImg = (path: string | undefined): string => {
    if (path == null) return `${ResourcePath.baseURL}profile/default`
    return `${ResourcePath.baseURL}profile/${path}`
  }

  static coordImg = (path: string): string => {
    return `${ResourcePath.baseURL}coord/${path}`
  }

  static bannerImg = (path: string | undefined): string | undefined => {
    if (path == null) return undefined
    return `${ResourcePath.baseURL}banner/${path}`
  }

  static closetImg = (path: string | undefined): string | undefined => {
    if (path == null) return undefined
    return `${ResourcePath.baseURL}closet/${path}`
  }

  static lookbookImg = (path: string | undefined): string | undefined => {
    if (path == null) return undefined
    return `${ResourcePath.baseURL}lookbook/${path}`
  }

  static reviewImg = (path: string | undefined): string => {
    return `${ResourcePath.baseURL}review/${path}`
  }
}
