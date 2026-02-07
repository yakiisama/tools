import { NextRequest, NextResponse } from 'next/server'

const TUNEHUB_API_KEY = process.env.TUNEHUB_API_KEY
const TUNEHUB_BASE_URL = process.env.TUNEHUB_BASE_URL || 'https://tunehub.sayqz.com/api'

export type MusicPlatform = 'netease' | 'qq' | 'kuwo'
export type MusicQuality = '128k' | '320k' | 'flac' | 'flac24bit'

/**
 * TuneHub Parse 响应中的歌曲信息
 */
interface TuneHubSongItem {
  id: string
  success: boolean
  url: string
  info: {
    name: string
    artist: string
    album: string
    duration: number
  }
  cover: string
  lyrics: string
  requestedQuality: string
  actualQuality: string
}

/**
 * TuneHub Parse API 响应结构
 */
interface TuneHubParseResponse {
  code: number
  success: boolean
  message?: string
  data?: {
    data: TuneHubSongItem[]
    total: number
    success_count: number
    fail_count: number
  }
}

/**
 * 歌曲解析接口 - 获取播放/下载链接
 * POST /api/music/parse
 * Body: { platform, id, quality }
 */
export async function POST(request: NextRequest) {
  if (!TUNEHUB_API_KEY) {
    console.error('TUNEHUB_API_KEY 未配置')
    return NextResponse.json(
      { code: -1, message: '服务器配置错误' },
      { status: 500 }
    )
  }

  let body: { platform: MusicPlatform; id: string; quality?: MusicQuality }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { code: -1, message: '请求体格式错误' },
      { status: 400 }
    )
  }

  const { platform, id, quality = '320k' } = body

  if (!platform || !id) {
    return NextResponse.json(
      { code: -1, message: '缺少必要参数 platform 或 id' },
      { status: 400 }
    )
  }

  // 验证平台
  const validPlatforms: MusicPlatform[] = ['netease', 'qq', 'kuwo']
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json(
      { code: -1, message: '不支持的平台' },
      { status: 400 }
    )
  }

  // 验证音质
  const validQualities: MusicQuality[] = ['128k', '320k', 'flac', 'flac24bit']
  if (!validQualities.includes(quality)) {
    return NextResponse.json(
      { code: -1, message: '不支持的音质' },
      { status: 400 }
    )
  }

  try {
    const parseUrl = `${TUNEHUB_BASE_URL}/v1/parse`
    const requestBody = {
      platform,
      ids: id,
      quality,
    }
    
    
    const res = await fetch(parseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TUNEHUB_API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    const data: TuneHubParseResponse = await res.json()
    

    if (data.code !== 0) {
      return NextResponse.json({
        code: data.code,
        message: data.message || '解析失败',
      })
    }

    // 正确提取嵌套的歌曲数据：data.data.data[0]
    const song = data.data?.data?.[0]
    if (!song || !song.success) {
      return NextResponse.json({
        code: -1,
        message: '未找到歌曲信息或解析失败',
      })
    }

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        id: song.id,
        name: song.info.name,
        artist: song.info.artist,
        album: song.info.album,
        pic: song.cover,
        url: song.url,
        lrc: song.lyrics,
        quality: song.actualQuality,
      },
    })
  } catch (error) {
    console.error('歌曲解析失败：', error)
    return NextResponse.json(
      { code: -1, message: '解析失败' },
      { status: 500 }
    )
  }
}
