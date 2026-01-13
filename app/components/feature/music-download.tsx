'use client'

import * as React from 'react'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { musicApi, type SearchResult, type MusicPlatform } from '../../api/music'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

/**
 * 平台显示名称映射
 */
const platformNames: Record<MusicPlatform, string> = {
  netease: '网易云',
  qq: 'QQ音乐',
  kuwo: '酷我',
}

/**
 * 平台颜色映射
 */
const platformColors: Record<MusicPlatform, string> = {
  netease: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  qq: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  kuwo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

/**
 * 平台图标映射
 */
const platformIcons: Record<MusicPlatform, string> = {
  netease: 'i-lucide:music',
  qq: 'i-lucide:headphones',
  kuwo: 'i-lucide:radio',
}

/**
 * 音乐搜索和下载组件
 */
export default function MusicDownload() {
  const [keyword, setKeyword] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [isDownloading, setIsDownloading] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = React.useState(false)

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
      
      if (response?.code === 200 && response.data?.results) {
        setResults(response.data.results)
        if (response.data.results.length === 0) {
          toast.info('未找到相关歌曲，请尝试其他关键词')
        } else {
          toast.success(`找到 ${response.data.total} 首歌曲`)
        }
      } else {
        throw new Error(response?.message || '搜索失败')
      }
    } catch (error) {
      console.error('搜索失败：', error)
      toast.error('搜索失败，请稍后重试')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * 处理下载请求
   */
  const handleDownload = async (song: SearchResult) => {
    setIsDownloading(song.id)

    try {
      // 直接使用 song.url 下载
      const fileName = `${song.name} - ${song.artist}.mp3`
      saveAs(song.url, fileName)
      
      toast.success('下载成功！请查看下载文件夹')
    } catch (error) {
      console.error('下载失败：', error)
      toast.error('下载失败，请稍后重试')
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
            支持搜索网易云、QQ音乐、酷我音乐平台的歌曲
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* 搜索结果 */}
      {hasSearched && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold">
              搜索结果
              {results.length > 0 && (
                <span className="text-muted-foreground text-base md:text-lg font-normal ml-2">
                  共 {results.length} 首
                </span>
              )}
            </h2>
          </div>

          {isSearching ? (
            /* 加载骨架屏 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length === 0 ? (
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
            /* 歌曲列表 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((song) => (
                <Card 
                  key={`${song.platform}-${song.id}`} 
                  className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 hover:-translate-y-1 overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3 md:gap-4">
                      {/* 专辑封面 */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                          {song.pic ? (
                            <img
                              src={song.pic}
                              alt={song.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-muted"><i class="i-lucide:music w-8 h-8 text-muted-foreground"></i></div>`
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <i className="i-lucide:music w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 歌曲信息 */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 
                            className="font-semibold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors" 
                            title={song.name}
                          >
                            {song.name}
                          </h3>
                          <p 
                            className="text-xs md:text-sm text-muted-foreground line-clamp-1" 
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
                            {song.album}
                          </p>
                        </div>

                        {/* 平台标签和下载按钮 */}
                        <div className="flex items-center justify-between gap-2 mt-3">
                          <span 
                            className={`text-xs px-2 py-1 rounded-full font-medium ${platformColors[song.platform]}`}
                          >
                            {platformNames[song.platform]}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(song)}
                            disabled={isDownloading === song.id}
                            className="h-8 px-3 text-xs font-medium min-w-[80px] touch-manipulation"
                          >
                            {isDownloading === song.id ? (
                              <>
                                <i className="i-lucide:loader-2 w-4 h-4 mr-1.5 animate-spin" />
                                下载中
                              </>
                            ) : (
                              <>
                                <i className="i-lucide:download w-4 h-4 mr-1.5" />
                                下载
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      {hasSearched && results.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-4 px-4 md:px-6">
            <div className="text-xs md:text-sm text-muted-foreground space-y-2">
              <p className="flex items-start gap-2">
                <i className="i-lucide:info w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>搜索结果来自多个音乐平台，您可以选择不同版本下载</span>
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

