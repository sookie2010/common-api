import { CreateElement, VNode } from 'vue'

export interface ArticleModel {
  _id: string
  path: string[] // 访问路径
  categories: string[] //分类
  tags: string[] // 标签
  title: string // 标题
  create_date: Date // 文章发布日期
  content_len: number // 正文长度
  is_splited: boolean // 是否分词
}

export interface TreeNodeBase {
  name: string | null // 节点名称(ID)
  deep: number // 节点深度(根节点为0)
}

export interface TreeNode extends TreeNodeBase {
  expand: boolean // 是否展开
  id?: string // 文章ID
  title: string //显示的文字
  children?: TreeNode[] // 子节点
  loading?: boolean // 是否显示加载中
  nodeKey?: number // 树节点唯一标识
  render?: (h: CreateElement, {data}: {data: TreeNode}) => Array<VNode | string>
}

export interface TreeNodeSource {
  _id: string
  cnt: number
  article_id: string | null
}