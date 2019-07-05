
export default class CommonUtils {
  /**
   * 对字符串中的正则元字符进行转义
   * @param source 原字符串
   * @returns 转义后的字符串
   */
  static escapeRegexStr(source: string): string {
    return source.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }
}
