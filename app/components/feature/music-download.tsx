'use client'

import * as React from 'react'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { musicApi, type SearchResult, type MusicPlatform, type MusicQuality } from '../../api/music'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

/**
 * 平台配置
 */
const platformConfig: { value: MusicPlatform; label: string; icon: string; color: string }[] = [
  { value: 'netease', label: '网易云音乐', icon: 'i-lucide:music', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' },
  { value: 'qq', label: 'QQ 音乐', icon: 'i-lucide:headphones', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  { value: 'kuwo', label: '酷我音乐', icon: 'i-lucide:radio', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
]

/**
 * 音质选项配置（酷我不支持 Hi-Res）
 */
const qualityOptions: { value: MusicQuality; label: string; desc: string; platforms: MusicPlatform[] }[] = [
  { value: '128k', label: '标准', desc: '128kbps MP3', platforms: ['netease', 'qq', 'kuwo'] },
  { value: '320k', label: '高品质', desc: '320kbps MP3', platforms: ['netease', 'qq', 'kuwo'] },
  { value: 'flac', label: '无损', desc: 'FLAC', platforms: ['netease', 'qq', 'kuwo'] },
  { value: 'flac24bit', label: 'Hi-Res', desc: '24bit FLAC', platforms: ['netease', 'qq'] },
]

/**
 * 音乐搜索和下载组件
 */
export default function MusicDownload() {
  const [keyword, setKeyword] = React.useState('')
  const [quality, setQuality] = React.useState<MusicQuality>('320k')
  const [isSearching, setIsSearching] = React.useState(false)
  const [isDownloading, setIsDownloading] = React.useState<string | null>(null)
  const [resultsByPlatform, setResultsByPlatform] = React.useState<Record<MusicPlatform, SearchResult[]>>({
    netease: [],
    qq: [],
    kuwo: [],
  })
  const [hasSearched, setHasSearched] = React.useState(false)
  const [successPlatforms, setSuccessPlatforms] = React.useState<MusicPlatform[]>([])

  // 计算总数
  const totalCount = Object.values(resultsByPlatform).reduce((sum, arr) => sum + arr.length, 0)

  /**
   * 处理搜索请求
   */
  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.error('请输入搜索关键词')
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await musicApi.searchMusic(keyword.trim())
      
      if (response?.code === 0 && response.data?.resultsByPlatform) {
        setResultsByPlatform(response.data.resultsByPlatform)
        setSuccessPlatforms(response.data.platforms)
        if (response.data.total === 0) {
          toast.info('未找到相关歌曲，请尝试其他关键词')
        } else {
          const platformInfo = response.data.platforms.map(p => 
            platformConfig.find(c => c.value === p)?.label
          ).join('、')
          toast.success(`在 ${platformInfo} 找到 ${response.data.total} 首歌曲`)
        }
      } else {
        throw new Error(response?.message || '搜索失败')
      }
    } catch (error) {
      console.error('搜索失败：', error)
      toast.error('搜索失败，请稍后重试')
      setResultsByPlatform({ netease: [], qq: [], kuwo: [] })
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * 获取歌曲对应平台支持的音质
   */
  const getQualityForPlatform = (platform: MusicPlatform): MusicQuality => {
    const isSupported = qualityOptions.find(opt => opt.value === quality)?.platforms.includes(platform)
    return isSupported ? quality : '320k'
  }

  /**
   * 处理下载请求 - 先解析获取链接再下载
   */
  const handleDownload = async (song: SearchResult) => {
    setIsDownloading(`${song.platform}-${song.id}`)
    const actualQuality = getQualityForPlatform(song.platform)

    try {
      const response = await musicApi.parseMusic(song.platform, song.id, actualQuality)
      
      if (response?.code !== 0 || !response.data?.url) {
        throw new Error(response?.message || '获取下载链接失败')
      }

      const ext = actualQuality.startsWith('flac') ? 'flac' : 'mp3'
      // 清理文件名中的非法字符，格式：歌曲名 - 歌手
      const sanitizeFileName = (name: string) => {
        return name.replace(/[/\\:*?"<>|]/g, '').trim()
      }
      const fileName = `${sanitizeFileName(song.name)}-${sanitizeFileName(song.artist)}.${ext}`
      
      saveAs(response.data.url, fileName)
      toast.success('开始下载！请查看下载文件夹')
    } catch (error) {
      console.error('下载失败：', error)
      toast.error(error instanceof Error ? error.message : '下载失败，请稍后重试')
    } finally {
      setIsDownloading(null)
    }
  }

  /**
   * 处理键盘回车事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch()
    }
  }

  /**
   * 渲染歌曲卡片
   */
  const renderSongCard = (song: SearchResult) => {
    const downloadKey = `${song.platform}-${song.id}`
    return (
      <Card 
        key={downloadKey}
        className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 hover:-translate-y-1 overflow-hidden"
      >
        <CardContent className="p-4">
          <div className="flex gap-3 md:gap-4">
            {/* 专辑封面 */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                {song.pic ? (
                  <img
                    src={song.pic}
                    alt={song.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-muted"><i class="i-lucide:music w-6 h-6 text-muted-foreground"></i></div>`
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <i className="i-lucide:music w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* 歌曲信息 */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 
                  className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors" 
                  title={song.name}
                >
                  {song.name}
                </h3>
                <p 
                  className="text-xs text-muted-foreground line-clamp-1" 
                  title={song.artist}
                >
                  <i className="i-lucide:user w-3 h-3 inline mr-1" />
                  {song.artist}
                </p>
                <p 
                  className="text-xs text-muted-foreground line-clamp-1" 
                  title={song.album}
                >
                  <i className="i-lucide:disc w-3 h-3 inline mr-1" />
                  {song.album || '未知专辑'}
                </p>
              </div>

              {/* 下载按钮 */}
              <div className="flex items-center justify-end mt-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(song)}
                  disabled={isDownloading === downloadKey}
                  className="h-7 px-3 text-xs font-medium touch-manipulation"
                >
                  {isDownloading === downloadKey ? (
                    <>
                      <i className="i-lucide:loader-2 w-3.5 h-3.5 mr-1 animate-spin" />
                      解析中
                    </>
                  ) : (
                    <>
                      <i className="i-lucide:download w-3.5 h-3.5 mr-1" />
                      下载
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜索区域 */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <i className="i-lucide:search w-5 h-5 md:w-6 md:h-6 text-primary" />
            搜索音乐
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            同时搜索网易云、QQ 音乐、酷我三大平台
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 音质选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">下载音质</Label>
            <Select value={quality} onValueChange={(v) => setQuality(v as MusicQuality)}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="选择音质" />
              </SelectTrigger>
              <SelectContent>
                {qualityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-muted-foreground text-xs">({opt.desc})</span>
                      {opt.value === 'flac24bit' && (
                        <span className="text-xs text-orange-500">(酷我不支持)</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 搜索框 */}
          <div className="space-y-3">
            <Label htmlFor="music-keyword" className="text-sm font-medium">
              搜索关键词
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <i className="i-lucide:music absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="music-keyword"
                  type="text"
                  placeholder="输入歌曲名、歌手名或专辑名..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                  className="pl-11 h-12 text-base"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!keyword.trim() || isSearching}
                size="lg"
                className="h-12 px-8 w-full sm:w-auto min-w-[120px] font-medium"
              >
                {isSearching ? (
                  <>
                    <i className="i-lucide:loader-2 w-5 h-5 mr-2 animate-spin" />
                    搜索中
                  </>
                ) : (
                  <>
                    <i className="i-lucide:search w-5 h-5 mr-2" />
                    搜索
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果 - 按平台分类展示 */}
      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold">
              搜索结果
              {totalCount > 0 && (
                <span className="text-muted-foreground text-base md:text-lg font-normal ml-2">
                  共 {totalCount} 首
                </span>
              )}
            </h2>
          </div>

          {isSearching ? (
            /* 加载骨架屏 */
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse w-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <Card key={j} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : totalCount === 0 ? (
            /* 空状态 */
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
                  <i className="i-lucide:music-off w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">未找到相关歌曲</h3>
                <p className="text-muted-foreground text-sm">
                  尝试使用其他关键词搜索
                </p>
              </CardContent>
            </Card>
          ) : (
            /* 按平台分类展示 */
            <div className="space-y-8">
              {platformConfig.map((platform) => {
                const songs = resultsByPlatform[platform.value]
                const isSuccess = successPlatforms.includes(platform.value)
                
                if (!isSuccess && songs.length === 0) {
                  return (
                    <div key={platform.value} className="space-y-3">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${platform.color}`}>
                        <i className={`${platform.icon} w-5 h-5`} />
                        <span className="font-medium">{platform.label}</span>
                        <span className="text-xs opacity-70">(请求失败)</span>
                      </div>
                    </div>
                  )
                }
                
                if (songs.length === 0) return null
                
                return (
                  <div key={platform.value} className="space-y-3">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${platform.color}`}>
                      <i className={`${platform.icon} w-5 h-5`} />
                      <span className="font-medium">{platform.label}</span>
                      <span className="text-xs opacity-70">({songs.length} 首)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {songs.map(renderSongCard)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      {hasSearched && totalCount > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-4 px-4 md:px-6">
            <div className="text-xs md:text-sm text-muted-foreground space-y-2">
              <p className="flex items-start gap-2">
                <i className="i-lucide:settings w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>当前下载音质：{qualityOptions.find(q => q.value === quality)?.label} ({qualityOptions.find(q => q.value === quality)?.desc})</span>
              </p>
              <p className="flex items-start gap-2">
                <i className="i-lucide:info w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Hi-Res 音质仅网易云和 QQ 音乐支持，酷我下载时自动降级为 320k</span>
              </p>
              <p className="flex items-start gap-2">
                <i className="i-lucide:shield-check w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>请遵守相关版权法律法规，仅用于个人学习研究使用</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
