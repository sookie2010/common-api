
export interface PhotoWallDto {
  /**
   * 多个ID, 用于批量删除
   */
  _ids: Array<string>
  /**
   * 名称模糊搜索
   */
  name: string
  /**
   * 宽度范围
   */
  widthMin: number
  widthMax: number
  /**
   * 高度范围
   */
  heightMin: number
  heightMax: number
}