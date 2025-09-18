import * as React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import KtvDownloadForm from '../components/feature/ktv-download-form'
import type { Metadata } from 'next'

/**
 * 页面元数据 - SEO 优化
 */
export const metadata: Metadata = {
  title: '全民 K 歌下载',
  description: '免费下载全民 K 歌中您的演唱作品，支持高品质 MP3 格式',
}

/**
 * K 歌下载页面组件 - Server Component
 * 使用 shadcn/ui 组件和 icônes 图标系统
 */
export default function KtvDownloadPage() {

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          全民 K 歌下载
        </h1>
        <p className="text-muted-foreground">
          下载您在全民 K 歌中的演唱作品
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 使用指南 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="i-lucide:book-open w-5 h-5 text-primary" />
              使用指南
            </CardTitle>
            <CardDescription>
              按照以下步骤获取歌曲链接
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm md:text-base">
              <StepItem number={1} text="打开全民K歌对应的歌曲页面" />
              
              <StepItem 
                number={2} 
                text={
                  <span>
                    点击右上角的
                    <b className="relative mx-1 text-primary">
                      三个点
                    </b>
                  </span>
                }
              />
              
              <StepItem 
                number={3} 
                text={
                  <span>
                    点击
                    <b className="relative mx-1 text-primary">
                      分享
                    </b>
                  </span>
                }
              />
              
              <StepItem 
                number={4} 
                text={
                  <span>
                    选择
                    <b className="relative mx-1 text-primary">
                      复制链接
                    </b>
                  </span>
                }
              />
              
              <StepItem number={5} text="粘贴链接到下方输入框" />
              <StepItem number={6} text="点击下载按钮" />
            </div>
          </CardContent>
        </Card>

        {/* 示例图片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="i-lucide:image w-5 h-5 text-primary" />
              操作示例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-48 md:w-56">
                <Image
                  src="/song.jpg"
                  alt="全民K歌操作示例"
                  width={200}
                  height={400}
                  className="rounded-lg shadow-md w-full h-auto"
                  priority
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 下载区域 - 客户端组件 */}
      <KtvDownloadForm />
    </div>
  )
}

/**
 * 步骤项组件
 */
interface StepItemProps {
  number: number
  text: React.ReactNode
}

function StepItem({ number, text }: StepItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
        {number}
      </div>
      <div className="flex-1 pt-0.5">
        {text}
      </div>
    </div>
  )
}
