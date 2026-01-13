import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import MusicDownload from '../components/feature/music-download'
import type { Metadata } from 'next'

/**
 * 页面元数据 - SEO 优化
 */
export const metadata: Metadata = {
  title: '音乐下载',
  description: '免费搜索和下载网易云、QQ音乐、酷我音乐平台的歌曲',
}

/**
 * 音乐下载页面组件 - Server Component
 */
export default function MusicDownloadPage() {
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          音乐下载
        </h1>
        <p className="text-muted-foreground">
          支持搜索和下载多个音乐平台的歌曲
        </p>
      </div>

      {/* 支持的平台 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <i className="i-lucide:music w-5 h-5 text-primary" />
              网易云音乐
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">
              支持搜索和下载网易云音乐平台的歌曲
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <i className="i-lucide:headphones w-5 h-5 text-primary" />
              QQ音乐
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">
              支持搜索和下载QQ音乐平台的歌曲
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <i className="i-lucide:radio w-5 h-5 text-primary" />
              酷我音乐
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">
              支持搜索和下载酷我音乐平台的歌曲
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和下载区域 */}
      <MusicDownload />
    </div>
  )
}

