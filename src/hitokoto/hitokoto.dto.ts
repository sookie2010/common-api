
export interface HitokotoDto {
  /**
   * a	Anime - 动画
   * b	Comic – 漫画
   * c	Game – 游戏
   * d	Novel – 小说
   * e	Myself – 原创
   * f	Internet – 来自网络
   * g	Other – 其他
   * (默认全部)
   */
  type: String,
  /**
   * text	返回纯净文本
   * json	返回不进行unicode转码的json文本(默认)
   */
  format: String
}