export interface FileDto {
  /**
   * 文件字段
   */
  fieldname: string
  /**
   * 文件名
   */
  originalname: string
  /**
   * 文件编码
   */
  encoding: string
  /**
   * MIME
   */
  mimetype: string
  /**
   * 文件字节码
   */
  buffer: Buffer
  /**
   * 文件体积
   */
  size: number
}