export default class ResourcePath {
  private static baseURL = `${process.env.DOMAIN}v1/resource/`
  static profileImg = (path: string | undefined): string => {
    if (path == null) return `${ResourcePath.baseURL}profile/default`
    return `${ResourcePath.baseURL}profile/${path}`
  }

  static coordImg = (path: string | undefined): string | undefined => {
    if (path == null) return undefined
    return `${ResourcePath.baseURL}coord/${path}`
  }
}
