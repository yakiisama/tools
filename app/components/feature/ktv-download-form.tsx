'use client'

import * as React from 'react'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { getSong } from '../../api/ktv'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

/**
 * K 歌下载表单组件 - 客户端组件
 * 处理用户交互和状态管理
 */
export default function KtvDownloadForm() {
  const [url, setUrl] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  /**
   * 处理下载请求
   * 包含 URL 验证和错误处理
   */
  const handleDownload = async () => {
    if (!url.trim()) {
      toast.error('请输入链接地址')
      return
    }

    if (!url.includes('http')) {
      toast.error('请输入正确的链接格式')
      return
    }

    setIsLoading(true)

    try {
      const data = await getSong(url)
      
      if (data?.url) {
        saveAs(data.url, `${data.songName || '歌曲'}.mp3`)
        toast.success('下载成功！请查看下载文件夹')
        setUrl('') // 清空输入框
      } else {
        throw new Error('获取下载链接失败')
      }
    } catch (error) {
      console.error('下载失败：', error)
      toast.error('下载失败，请检查链接是否正确或稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理键盘回车事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleDownload()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="i-lucide:download w-5 h-5 text-primary" />
          下载歌曲
        </CardTitle>
        <CardDescription>
          粘贴您从全民 K 歌复制的链接
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="song-url">歌曲链接</Label>
          <div className="relative">
            <i className="i-lucide:link absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="song-url"
              type="url"
              placeholder="https://kg.qq.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            粘贴从全民 K 歌复制的分享链接
          </p>
        </div>

        <Button
          onClick={handleDownload}
          disabled={!url.trim() || isLoading}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <i className="i-lucide:loader-2 w-4 h-4 mr-2 animate-spin" />
              下载中...
            </>
          ) : (
            <>
              <i className="i-lucide:download w-4 h-4 mr-2" />
              开始下载
            </>
          )}
        </Button>

        {/* 提示信息 */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p className="flex items-center gap-1">
            <i className="i-lucide:info w-3 h-3" />
            仅支持下载您本人的演唱作品
          </p>
          <p className="flex items-center gap-1">
            <i className="i-lucide:file-audio w-3 h-3" />
            下载的音频文件为 MP3 格式
          </p>
          <p className="flex items-center gap-1">
            <i className="i-lucide:shield-check w-3 h-3" />
            请遵守相关版权法律法规
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
