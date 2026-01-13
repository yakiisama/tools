import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

/**
 * 工具项目数据类型
 */
interface ToolItem {
  name: string
  description: string
  href: string
  icon: string
  status?: 'available' | 'coming-soon'
}

/**
 * 工具列表数据
 */
const tools: ToolItem[] = [
  {
    name: '音乐下载',
    description: '支持搜索和下载网易云、QQ音乐、酷我音乐平台的歌曲',
    href: '/music',
    icon: 'i-lucide:headphones',
    status: 'available'
  },
  {
    name: 'K 歌下载',
    description: '支持全民 K 歌作品下载，保存您的精彩演唱到本地',
    href: '/ktv',
    icon: 'i-lucide:music',
    status: 'available'
  },
  {
    name: '海拔测量',
    description: '基于GPS技术实时测量当前位置的海拔高度',
    href: '/altitude',
    icon: 'i-lucide:mountain',
    status: 'available'
  },
  {
    name: '视频工具',
    description: '视频格式转换、压缩、剪辑等实用功能',
    href: '#',
    icon: 'i-lucide:video',
    status: 'coming-soon'
  },
  {
    name: '图片处理',
    description: '图片压缩、格式转换、尺寸调整等功能',
    href: '#',
    icon: 'i-lucide:image',
    status: 'coming-soon'
  },
  {
    name: '文本工具',
    description: 'JSON 格式化、Base64 编解码、文本处理',
    href: '#',
    icon: 'i-lucide:file-text',
    status: 'coming-soon'
  }
]

/**
 * 首页组件 - 展示所有可用工具
 */
export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* 页面标题和介绍 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          工具箱
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          日常使用的实用工具集合，让您的生活更加便捷高效
        </p>
      </div>

      {/* 工具卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <ToolCard key={tool.name} item={tool} index={index} />
        ))}
      </div>

      {/* 底部提示 */}
      <div className="text-center pt-8">
        <p className="text-muted-foreground">
          更多工具正在开发中，敬请期待...
        </p>
      </div>
    </div>
  )
}

/**
 * 工具卡片组件
 */
interface ToolCardProps {
  item: ToolItem
  index: number
}

function ToolCard({ item }: ToolCardProps) {
  // 如果是即将推出的功能，显示占位卡片
  if (item.status === 'coming-soon') {
    return (
      <div className="relative">
        <Card className="h-full opacity-60 cursor-not-allowed">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <i className={`${item.icon} w-8 h-8 text-muted-foreground`} />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl text-muted-foreground">
                  {item.name}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <CardDescription className="text-sm md:text-base leading-relaxed">
              {item.description}
            </CardDescription>
          </CardContent>
        </Card>
        
        {/* 即将推出标签 */}
        <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
          即将推出
        </div>
      </div>
    )
  }

  return (
    <Link href={item.href} className="group">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/20 cursor-pointer group-hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <i className={`${item.icon} w-8 h-8 text-primary group-hover:scale-110 transition-transform`} />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl text-card-foreground">
                {item.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="text-sm md:text-base leading-relaxed">
            {item.description}
          </CardDescription>
          
          <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
            <span>立即使用</span>
            <i className="i-lucide:arrow-right ml-1 w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}