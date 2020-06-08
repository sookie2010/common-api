export default [
  {
    name: 'system',
    title: '系统管理',
    icon: 'md-options',
    child: [
      { title: '系统配置', path: '/system/config', icon: 'md-settings' },
      { title: '用户管理', path: '/system/user', icon: 'md-contact' },
      { title: '角色管理', path: '/system/role', icon: 'md-contacts' },
      { title: '博客文章', path: '/system/article', icon: 'md-paper' },
      { title: '分析统计', path: '/system/statistics', icon: 'md-pie' }
    ]
  },{
    name: 'api',
    title: 'API数据',
    icon: 'logo-buffer',
    child: [
      { title: '一言', path: '/api/hitokoto', icon: 'md-chatbubbles' },
      { title: '照片墙', path: '/api/photoWall', icon: 'md-images' },
      { title: '图片资源库', path: '/api/sourceImage', icon: 'md-image' },
      { title: '中国行政区划', path: '/api/chinaProvince', icon: 'md-map' },
      { title: '歌曲库', path: '/api/music', icon: 'md-musical-note' }
    ]
  },{
    name: 'tool',
    title: '工具',
    icon: 'md-build',
    child: [
      { title: 'SQL占位符替换', path: '/tool/sqlReplace', icon: 'md-copy' }
    ]
  }
]