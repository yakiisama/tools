interface Props {
  params?: Record<string, any>
  data?: Record<string, any>
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
}

export type MethodProps = Pick<Props, 'data' | 'params'>

abstract class BaseApi {
  protected abstract baseUrl: string
  public static async request<T = unknown>(options: Props) {
    const newOptions: RequestInit = {
      ...options,
    }
    if (options.method !== 'GET') {
      newOptions.headers = {
        'Content-type': 'application/json',
      }
      if (options.data) {
        newOptions.body = JSON.stringify(options.data)
      }
    }
    const qs = options.params && new URLSearchParams(options.params)
    const res = await fetch(`${options.url}${qs ? `?${qs}` : ''}`, newOptions)
    const { status } = res
    if (status >= 200 && status < 300) {
      return res.json() as T
    }
    throw new Error('请求失败')
  }

  public async request<T = unknown>(
    method: Props['method'],
    path: string,
    options: MethodProps
  ) {
    const url = `${this.baseUrl}${path}`
    return BaseApi.request<T>({
      method,
      url,
      data: options.data,
      params: options.params,
    })
  }

  public post<T = any>(path: string, option?: MethodProps) {
    const options = Object.assign({ method: 'POST' }, option)
    return this.request<T>('POST', path, options)
  }

  public put<T = any>(path: string, option?: MethodProps) {
    const options = Object.assign({ method: 'PUT' }, option)
    return this.request<T>('PUT', path, options)
  }

  public get<T = any>(path: string, option?: MethodProps) {
    const options = Object.assign({ method: 'GET' }, option)
    return this.request<T>('GET', path, options)
  }
}

class Api extends BaseApi {
  protected baseUrl = 'https://song-beryl.vercel.app'
}

class SystemApi extends BaseApi {
  protected baseUrl = 'https://api.lolimi.cn'
}

export const request = new Api()

export const sysRequest = new SystemApi()
