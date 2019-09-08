
import * as crypto from 'crypto'

export default class CommonUtils {
  /**
   * 对字符串中的正则元字符进行转义
   * @param source 原字符串
   * @returns 转义后的字符串
   */
  static escapeRegexStr(source: string): string {
    return source.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }
  /**
   * 计算数据的哈希值
   * @param data 需要处理的数据
   * @param hashType 哈希类型 例如md5 sha1
   */
  static dataHash(data: Buffer|string, hashType: string): string {
    const fsHash = crypto.createHash(hashType)
    fsHash.update(data)
    return fsHash.digest('hex')
  }
}
