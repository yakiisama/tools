/**
 * 音乐平台类型
 */
export type MusicPlatform = 'netease' | 'qq' | 'kuwo'

/**
 * 音质类型
 */
export type MusicQuality = '128k' | '320k' | 'flac' | 'flac24bit'

/**
 * 搜索结果中的歌曲信息
 */
export interface SearchResult {
  id: string
  name: string
  artist: string
  album: string
  platform: MusicPlatform
  pic?: string
}

/**
 * 搜索响应数据
 */
export interface SearchResponseData {
  keyword: string
  platform: MusicPlatform
  page: number
  pageSize: number
  total: number
  results: SearchResult[]
}

/**
 * 解析结果
 */
export interface ParseResult {
  id: string
  name: string
  artist: string
  album: string
  pic?: string
  url: string
  lrc?: string
  quality: MusicQuality
}

/**
 * API 响应格式
 */
export interface ApiResponse<T> {
  code: number
  message: string
  data?: T
}

/**
 * 音乐 API 客户端
 */
class MusicApi {
  /**
   * 搜索音乐（单平台）
   * @param keyword - 搜索关键词
   * @param platform - 音乐平台
   * @param page - 页码，默认 1
   * @param pageSize - 每页数量，默认 20
   */
  async searchMusic(
    keyword: string,
    platform: MusicPlatform,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<SearchResponseData> | null> {
    try {
      const params = new URLSearchParams({
        keyword,
        platform,
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      const res = await fetch(`/api/music/search?${params}`)
      return res.json()
    } catch (error) {
      console.error('搜索请求失败:', error)
      return null
    }
  }

  /**
   * 解析歌曲获取下载链接
   * @param platform - 音乐平台
   * @param id - 歌曲 ID
   * @param quality - 音质，默认 320k
   */
  async parseMusic(
    platform: MusicPlatform,
    id: string,
    quality: MusicQuality = '320k'
  ): Promise<ApiResponse<ParseResult> | null> {
    try {
      const res = await fetch('/api/music/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, id, quality }),
      })
      return res.json()
    } catch (error) {
      console.error('解析请求失败:', error)
      return null
    }
  }
}

export const musicApi = new MusicApi()
