import {
  BasicProfile,
  DemanderProfile,
  Img,
  Review,
  ReviewModelData,
  SupplierProfile,
} from './profile-type'
import ResourcePath from '../resource/resource-path'
import DIContainer from '../../config/inversify.config'
import DB from '../../config/db'
import { injectable } from 'inversify'
import { ForbiddenError, NotFoundError } from '../../config/Error'
import Data from '../../data/data'
import S3 from '../../config/s3'

@injectable()
export default class ProfileModel {
  db = DIContainer.get(DB)
  s3 = DIContainer.get(S3)

  getDemander = async (
    userId: number,
  ): Promise<BasicProfile & DemanderProfile> => {
    const sql = `SELECT u.name, u.email, u.img AS u.profileImg, u.profile, u.phone, t.styles FROM users u 
LEFT JOIN (SELECT user_id, json_arrayagg(style_id) as styles FROM user_style GROUP BY user_id) t ON t.user_id = u.user_id
WHERE u.user_id=:userId`
    const value = { userId }
    const [rows] = await this.db.query(sql, value)

    if (rows[0] == null) {
      throw new NotFoundError()
    }

    const { name, email, profileImg, phone, profile } = rows[0]
    const styles =
      rows[0].styles != null ? Data.getStyleItemList(rows[0].styles) : undefined
    if (profile.body != null) {
      profile.body = Data.getBodyItem(profile.body)
    }
    if (profile.skin != null) {
      profile.skin = Data.getSkinItem(profile.skin)
    }
    return {
      userType: 'D',
      name,
      email,
      profileImg,
      phone,
      styles,
      ...profile,
    }
  }
  getSupplier = async (
    userId: number,
  ): Promise<BasicProfile & SupplierProfile> => {
    const sql = `SELECT u.name, u.email, u.img AS profileImg, u.phone, u.profile, s.price, c.coord, t.styles FROM users u
LEFT JOIN (SELECT user_id, json_arrayagg(style_id) as styles FROM user_style GROUP BY user_id) t ON t.user_id = u.user_id
LEFT JOIN suppliers s ON s.user_id = u.user_id
LEFT JOIN (SELECT user_id, json_arrayagg(JSON_OBJECT('id', lookbook_id, 'img', img_path)) as coord FROM lookbooks WHERE represent = 1 GROUP BY user_id) c ON c.user_id = u.user_id
WHERE u.user_id=:userId;`
    const value = { userId }
    const [rows] = await this.db.query(sql, value)

    if (rows[0] == null) {
      throw new NotFoundError()
    }

    const { name, email, profileImg, phone, price, coord, profile } = rows[0]
    const styles =
      rows[0].styles != null ? Data.getStyleItemList(rows[0].styles) : undefined
    return {
      userType: 'S',
      name,
      email,
      profileImg,
      styles,
      phone,
      price,
      coord,
      ...profile,
    }
  }

  saveBasic = async (userId: number, basicProfile: BasicProfile) => {
    let fields = ''
    for (const key of ['name', 'email', 'profileImg', 'phone']) {
      if (basicProfile[key] != null) fields += `${key}=:${key},`
    }
    if (fields.length == 0) return
    fields = fields.substring(0, fields.length - 1)

    const sql = `UPDATE users SET ${fields} where user_id=:userId`

    await this.db.query(sql, {
      userId,
      ...basicProfile,
    })
  }

  saveProfile = async (
    userId: number,
    profile: DemanderProfile | SupplierProfile,
  ): Promise<void> => {
    const sql = 'UPDATE users SET profile=:profile where user_id=:userId'

    await this.db.query(sql, {
      userId,
      profile: JSON.stringify(profile),
    })
  }

  getProfile = async (
    userId: number,
  ): Promise<DemanderProfile | SupplierProfile> => {
    const sql = 'SELECT profile FROM users where user_id=:userId'

    const [rows] = await this.db.query(sql, {
      userId,
    })

    if (rows[0] == null) {
      throw NotFoundError
    }

    return rows[0].profile ?? {}
  }

  savePrice = async (userId: number, price: number): Promise<void> => {
    const sql = 'UPDATE suppliers SET price=:price where user_id=:userId'

    await this.db.query(sql, { userId, price })
  }

  getSupplierPoint = async (
    userId: number,
  ): Promise<{
    hireCount: number
    reviewCount: number
    rating: number | undefined
  }> => {
    const sql = `SELECT r.user_id, COUNT(*) AS hireCount, COUNT(rating) AS reviewCount, ROUND(AVG(rating),2) AS rating FROM coords c
LEFT JOIN payments e ON e.payment_id = c.payment_id
LEFT JOIN room_user r ON r.room_id = e.room_id AND r.user_type='S'
LEFT JOIN coord_reviews cr ON cr.coord_id = c.coord_id
WHERE r.user_id=:userId
GROUP BY r.user_id;`

    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    if (rows[0] == null) {
      return {
        hireCount: 0,
        reviewCount: 0,
        rating: undefined,
      }
    }

    return rows[0]
  }

  // saveProfile = async (
  //   userId: number,
  //   name: string | undefined,
  //   phone: string | undefined,
  //   introduction: string | undefined,
  //   profile: string | undefined,
  // ): Promise<void> => {
  //   if (
  //     name == null &&
  //     introduction == null &&
  //     phone == null &&
  //     profile == null
  //   )
  //     return
  //
  //   const data = {
  //     name,
  //     introduction,
  //     profile,
  //     phone: phone?.replace?.(/-/gi, '')?.replace(/ /gi, ''),
  //   }
  //   let fields = ''
  //   for (const key in data) {
  //     if (data[key] != null) fields += `${key}=:${key},`
  //   }
  //
  //   fields = fields.substring(0, fields.length - 1)
  //
  //   const sql = `UPDATE users SET ${fields} WHERE user_id=:userId`
  //
  //   const value = { userId, name, introduction, phone, profile }
  //
  //   await this.db.query(sql, value)
  // }

  getBasicProfile = async (
    userId: number,
  ): Promise<{
    name: string | undefined
    introduction: string | undefined
    img: string | undefined
    phone: string | undefined
    profile: any
    onboard: any
  }> => {
    const sql =
      'SELECT name, introduction, profile, phone, img, onboard FROM users WHERE user_id=:userId'

    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    return rows[0] as any
  }

  getClosetList = async (userId: number): Promise<Img[]> => {
    const sql =
      'SELECT closet_id as id, img_path as img FROM closets WHERE user_id = :userId;'

    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    return rows.map((row) => {
      const { id, img } = row
      return {
        id,
        img: ResourcePath.closetImg(img),
      }
    })
  }

  getPrice = async (userId: number): Promise<number> => {
    const sql = 'SELECT price FROM suppliers WHERE user_id = :userId;'

    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    return rows[0].price
  }
  // getReviewList = async (userId: number): Promise<Img[]> => {
  //
  //   const sql =
  //     'SELECT closet_id as id, img_path as img FROM closets WHERE user_id = :userId;'
  //
  //   const value = { userId }
  //
  //   const [rows] = await this.db.query(sql, value)
  //
  //   connection.release()
  //
  //   return rows as Img[]
  // }

  getCoordList = async (userId: number): Promise<Img[]> => {
    const sql =
      'SELECT lookbook_id AS id, img_path AS img FROM lookbooks WHERE user_id = :userId AND represent = 1;'

    const value = { userId }

    const [rows] = await this.db.query(sql, value)

    return rows.map((row) => {
      const { id, img } = row
      return {
        id,
        img: ResourcePath.lookbookImg(img),
      }
    })
  }

  getLookbookList = async (userId: number, page: number): Promise<Img[]> => {
    const pageAmount = 20

    const sql =
      'SELECT lookbook_id AS id, img_path AS img FROM lookbooks WHERE user_id = :userId AND represent = 0 LIMIT :pageOffset, :pageAmount;'

    const value = { userId, pageAmount, pageOffset: page * pageAmount }

    const [rows] = await this.db.query(sql, value)

    return rows.map((row) => {
      const { id, img } = row
      return {
        id,
        img: ResourcePath.lookbookImg(img),
      }
    })
  }
  deleteLookbook = async (
    lookbookId: number,
    userId: number,
  ): Promise<void> => {
    const sql =
      'DELETE from lookbooks where lookbook_id = :lookbookId and user_id = :userId '

    const value = { lookbookId, userId }

    const [rows] = await this.db.query(sql, value)

    if (rows['affectedRows'] != 1) throw ForbiddenError
  }

  getCloset = async (userId: number, page: number): Promise<Img[]> => {
    const pageAmount = 20

    const sql =
      'SELECT closet_id AS id, img_path AS img FROM closets WHERE user_id=:userId LIMIT :pageOffset, :pageAmount;'

    const value = { userId, pageAmount, pageOffset: page * pageAmount }

    const [rows] = await this.db.query(sql, value)

    return rows.map((row) => {
      const { id, img } = row
      return {
        id,
        img: ResourcePath.lookbookImg(img),
      }
    })
  }

  deleteCloset = async (closetId: number, userId: number): Promise<void> => {
    const sql =
      'DELETE from closets where closet_id = :closetId and user_id = :userId '

    const value = { closetId, userId }

    const [rows] = await this.db.query(sql, value)

    if (rows['affectedRows'] != 1) throw ForbiddenError
  }

  deleteProfileImg = async (userId: number): Promise<void> => {
    const sql = 'Update users SET img = null where user_id = :userId '

    const value = { userId }

    await this.db.query(sql, value)
  }
  getReviewListDemander = async (demanderId: number): Promise<Review[]> => {
    const sql = `SELECT r.coord_id AS reviewId, c.img, rs.user_id AS supplierId, 1 as status  FROM coord_reviews r
LEFT JOIN coords c ON c.coord_id = r.coord_id
LEFT JOIN payments e ON e.payment_id = c.payment_id
LEFT JOIN room_user rd ON rd.room_id = e.room_id AND rd.user_type='D'
LEFT JOIN room_user rs ON rs.room_id = e.room_id AND rs.user_type='S'
WHERE rd.user_id=:demanderId
LIMIT 3`

    const value = { demanderId }

    const [rows] = await this.db.query(sql, value)

    return rows as Review[]
  }

  getReviewListSupplier = async (
    supplierId: number,
    page: number,
  ): Promise<ReviewModelData[]> => {
    const pageAmount = 20

    const sql = `SELECT r.coord_id AS id, u.name, u.img AS profileImg, cc.coordImg, r.content, r.rating, r.public_body AS publicBody, t.type, u.profile, u.onboard, r.create_time AS date  FROM coord_reviews r
LEFT JOIN coords c ON c.coord_id = r.coord_id
LEFT JOIN payments e ON e.payment_id = c.payment_id
LEFT JOIN (
    SELECT coord_id, json_arrayagg(img) as coordImg FROM coord_clothes GROUP BY coord_id
) cc ON cc.coord_id = c.coord_id
LEFT JOIN room_user rd ON rd.room_id = e.room_id AND rd.user_type='D'
LEFT JOIN room_user rs ON rs.room_id = e.room_id AND rs.user_type='S'
LEFT JOIN (
    SELECT user_id, json_arrayagg(style_id) AS type FROM user_style
    GROUP BY user_id
) t ON rd.user_id = t.user_id
LEFT JOIN users u ON rd.user_id = u.user_id
WHERE rs.user_id=:supplierId
LIMIT :pageOffset, :pageAmount;`

    const value = { supplierId, pageAmount, pageOffset: page * pageAmount }

    const [rows] = await this.db.query(sql, value)

    return rows as ReviewModelData[]
  }

  getReviewImg = async (
    id: number,
  ): Promise<Array<{ img: string; type: string }>> => {
    const sql = `SELECT img, type FROM coord_review_imgs WHERE coord_id = :id`

    const value = { id }

    const [rows] = await this.db.query(sql, value)

    return rows as Array<{ img: string; type: string }>
  }

  updateSupplierData = async (userId: number, price: number): Promise<void> => {
    const sql = `UPDATE suppliers SET price=:price WHERE user_id=:userId`

    const value = { userId, price }

    await this.db.query(sql, value)
  }

  postProfileImg = async (userId: number, path: string): Promise<number> => {
    const sql = `UPDATE users SET img=:path WHERE user_id=:userId`

    const value = { userId, path }

    const [result] = await this.db.query(sql, value)

    return result['insertId']
  }

  postLookbook = async (
    userId: number,
    path: string,
    represent: boolean,
  ): Promise<number> => {
    const sql = `INSERT INTO lookbooks(img_path, user_id, represent) VALUES(:path, :userId, :represent)`

    const value = { userId, path, represent: represent ? 1 : 0 }

    const [result] = await this.db.query(sql, value)

    return result['insertId']
  }

  postCloset = async (userId: number, path: string): Promise<number> => {
    const sql = `INSERT INTO closets(img_path, user_id) VALUES(:path, :userId)`

    const value = { userId, path }

    const [result] = await this.db.query(sql, value)

    return result['insertId']
  }
}
