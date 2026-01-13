import { BaseApi } from './fetch'

/**
 * 音乐平台类型
 */
export type MusicPlatform = 'netease' | 'qq' | 'kuwo'

/**
 * 平台统计信息
 */
export interface PlatformStats {
  success: boolean
  count: number
  duration: number
  error: string | null
}

/**
 * 搜索结果中的歌曲信息
 */
export interface SearchResult {
  id: string
  name: string
  artist: string
  album: string
  platform: MusicPlatform
  url: string
  pic: string
  lrc: string
}

/**
 * 搜索响应数据
 */
export interface SearchResponseData {
  keyword: string
  limit: number
  page: number
  platforms: MusicPlatform[]
  platformStats: Record<MusicPlatform, PlatformStats>
  total: number
  results: SearchResult[]
}

/**
 * API 响应格式
 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

/**
 * 音乐下载 API 客户端
 */
class MusicApi extends BaseApi {
  protected baseUrl = 'https://music-dl.sayqz.com'

  /**
   * 聚合搜索音乐
   * @param keyword - 搜索关键词
   * @param limit - 每页数量，默认 10
   * @param page - 页码，默认 1
   */
  async searchMusic(
    keyword: string,
    limit: number = 10,
    page: number = 1
  ) {
    return this.get<ApiResponse<SearchResponseData>>('/api/', {
      params: {
        type: 'aggregateSearch',
        keyword,
        limit: limit.toString(),
        page: page.toString(),
      },
    })
  }
}

export const musicApi = new MusicApi()

