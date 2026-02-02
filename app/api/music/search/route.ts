import { NextRequest, NextResponse } from 'next/server'

const TUNEHUB_API_KEY = process.env.TUNEHUB_API_KEY
const TUNEHUB_BASE_URL = process.env.TUNEHUB_BASE_URL || 'https://tunehub.sayqz.com/api'

export type MusicPlatform = 'netease' | 'qq' | 'kuwo'

interface MethodConfig {
  type: string
  method: string
  url: string
  params?: Record<string, string>
  body?: Record<string, unknown>
  headers?: Record<string, string>
  transform?: string
}

interface TuneHubResponse<T> {
  code: number
  data: T
  message?: string
}

interface SearchResultItem {
  id: string
  name: string
  artist: string
  album: string
  pic?: string
  platform: MusicPlatform
}

/**
 * 解析模板变量，支持 JavaScript 表达式
 */
function parseTemplate(
  template: string,
  context: Record<string, string | number>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, expr) => {
    try {
      const fn = new Function(...Object.keys(context), `return ${expr}`)
      const result = fn(...Object.values(context))
      return String(result)
    } catch {
      console.error(`模板解析失败：${expr}`)
      return `{{${expr}}}`
    }
  })
}

/**
 * 递归解析对象中的所有模板变量
 */
function parseTemplateObject(
  obj: unknown,
  context: Record<string, string | number>
): unknown {
  if (typeof obj === 'string') {
    return parseTemplate(obj, context)
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => parseTemplateObject(item, context))
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = parseTemplateObject(value, context)
    }
    return result
  }
  return obj
}

/**
 * 搜索单个平台
 */
async function searchPlatform(
  platform: MusicPlatform,
  keyword: string,
  page: number,
  limit: number
): Promise<SearchResultItem[]> {
  const methodUrl = `${TUNEHUB_BASE_URL}/v1/methods/${platform}/search`
  const methodRes = await fetch(methodUrl, {
    headers: { 'X-API-Key': TUNEHUB_API_KEY! },
  })
  const methodData: TuneHubResponse<MethodConfig> = await methodRes.json()

  if (methodData.code !== 0 || !methodData.data) {
    throw new Error(`获取 ${platform} 方法配置失败：${methodData.message || '无数据'}`)
  }

  const config = methodData.data
  const context: Record<string, string | number> = {
    keyword,
    page,
    limit,
    pageSize: limit,
  }

  let queryString = ''
  if (config.params) {
    const parsedParams = parseTemplateObject(config.params, context) as Record<string, string>
    queryString = new URLSearchParams(parsedParams).toString()
  }

  let bodyData: string | undefined
  if (config.body) {
    const parsedBody = parseTemplateObject(config.body, context)
    bodyData = JSON.stringify(parsedBody)
  }

  const requestUrl = queryString ? `${config.url}?${queryString}` : config.url

  const upstreamRes = await fetch(requestUrl, {
    method: config.method,
    headers: config.headers || {},
    body: bodyData,
  })

  const upstreamData = await upstreamRes.text()

  let results: SearchResultItem[] = []
  if (config.transform) {
    try {
      const transformFn = new Function('response', `return (${config.transform})(response)`)
      const parsed = JSON.parse(upstreamData)
      results = transformFn(parsed)
    } catch (e) {
      console.error(`[${platform}] transform 执行失败:`, e)
      results = []
    }
  } else {
    try {
      results = JSON.parse(upstreamData)
    } catch {
      results = []
    }
  }

  if (!Array.isArray(results)) {
    results = []
  }

  return results.map((item) => ({
    ...item,
    platform,
  }))
}

/**
 * 单平台搜索接口
 * GET /api/music/search?keyword=xxx&platform=netease&page=1&pageSize=20
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword')
  const platform = searchParams.get('platform') as MusicPlatform | null
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  if (!keyword) {
    return NextResponse.json({ code: -1, message: '缺少搜索关键词' }, { status: 400 })
  }

  if (!platform) {
    return NextResponse.json({ code: -1, message: '缺少平台参数' }, { status: 400 })
  }

  const validPlatforms: MusicPlatform[] = ['netease', 'qq', 'kuwo']
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ code: -1, message: '不支持的平台' }, { status: 400 })
  }

  if (!TUNEHUB_API_KEY) {
    console.error('TUNEHUB_API_KEY 未配置')
    return NextResponse.json({ code: -1, message: '服务器配置错误' }, { status: 500 })
  }

  try {
    const results = await searchPlatform(platform, keyword, page, pageSize)

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        keyword,
        platform,
        page,
        pageSize,
        total: results.length,
        results,
      },
    })
  } catch (error) {
    console.error(`[${platform}] 搜索失败:`, error)
    return NextResponse.json({ code: -1, message: '搜索失败' }, { status: 500 })
  }
}
