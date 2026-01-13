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
  kuwo: '酷我音乐',
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="i-lucide:search w-5 h-5 text-primary" />
            搜索音乐
          </CardTitle>
          <CardDescription>
            支持搜索网易云、QQ音乐、酷我音乐平台的歌曲
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="music-keyword">搜索关键词</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <i className="i-lucide:music absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="music-keyword"
                  type="text"
                  placeholder="输入歌曲名、歌手名或专辑名..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!keyword.trim() || isSearching}
                size="lg"
              >
                {isSearching ? (
                  <>
                    <i className="i-lucide:loader-2 w-4 h-4 mr-2 animate-spin" />
                    搜索中...
                  </>
                ) : (
                  <>
                    <i className="i-lucide:search w-4 h-4 mr-2" />
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              搜索结果
              {results.length > 0 && (
                <span className="text-muted-foreground text-base font-normal ml-2">
                  ({results.length} 首)
                </span>
              )}
            </h2>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <i className="i-lucide:music-off w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">未找到相关歌曲</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((song) => (
                <Card key={`${song.platform}-${song.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* 专辑封面 */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                          {song.pic ? (
                            <img
                              src={song.pic}
                              alt={song.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <i className="i-lucide:music w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* 歌曲信息 */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="font-semibold text-sm truncate" title={song.name}>
                            {song.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate" title={song.artist}>
                            {song.artist}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={song.album}>
                            {song.album}
                          </p>
                        </div>

                        {/* 平台标签和下载按钮 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <i className={platformIcons[song.platform]} />
                            <span>{platformNames[song.platform]}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(song)}
                            disabled={isDownloading === song.id}
                            className="h-7 text-xs"
                          >
                            {isDownloading === song.id ? (
                              <>
                                <i className="i-lucide:loader-2 w-3 h-3 mr-1 animate-spin" />
                                下载中
                              </>
                            ) : (
                              <>
                                <i className="i-lucide:download w-3 h-3 mr-1" />
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
      {hasSearched && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1">
                <i className="i-lucide:info w-3 h-3" />
                搜索结果来自多个音乐平台，请选择您需要的版本下载
              </p>
              <p className="flex items-center gap-1">
                <i className="i-lucide:shield-check w-3 h-3" />
                请遵守相关版权法律法规，仅用于个人学习研究
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

