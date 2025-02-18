import { toast } from 'sonner';

interface Props {
  params?: Record<string, any>;
  data?: Record<string, any>;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
}

export type MethodProps = Pick<Props, 'data' | 'params'>;

abstract class BaseApi {
  protected abstract baseUrl: string;
  public static async request<T = unknown>(options: Props) {
    const newOptions: RequestInit = {
      ...options,
    };
    if (options.method !== 'GET') {
      newOptions.headers = {
        'Content-type': 'application/json',
      };
      if (options.data) {
        newOptions.body = JSON.stringify(options.data);
      }
    }
    const qs = options.params && new URLSearchParams(options.params);
    try {
      const res = await fetch(
        `${options.url}${qs ? `?${qs}` : ''}`,
        newOptions
      );
      const { status } = res;
      if (status >= 200 && status < 300) {
        return res.json() as T;
      }
      toast.error('请求失败');
    } catch (error: any) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // 处理网络错误和 CORS 错误
        toast.error('无法连接到服务器，请检查您的网络连接或 CORS 设置。大概率是链接不对，请检查');
      } else if (error.name === 'AbortError') {
        // 处理超时错误
        toast.error('请求超时，请稍后重试。');
      } else {
        // 处理其他错误
        toast.error('发生未知错误，请稍后重试或联系管理员。');
      }
      return null;
    }
  }

  public async request<T = unknown>(
    method: Props['method'],
    path: string,
    options: MethodProps
  ) {
    const url = `${this.baseUrl}${path}`;
    return BaseApi.request<T>({
      method,
      url,
      data: options.data,
      params: options.params,
    });
  }

  public post<T = any>(path: string, option?: MethodProps) {
    const options = Object.assign({ method: 'POST' }, option);
    return this.request<T>('POST', path, options);
  }

  public put<T = any>(path: string, option?: MethodProps) {
    const options = Object.assign({ method: 'PUT' }, option);
    return this.request<T>('PUT', path, options);
  }

  public get<T = any>(path: string, option?: MethodProps) {
    const options = Object.assign({ method: 'GET' }, option);
    return this.request<T>('GET', path, options);
  }
}

class Api extends BaseApi {
  protected baseUrl = 'https://song-beryl.vercel.app';
}

class SystemApi extends BaseApi {
  protected baseUrl = 'https://api.lolimi.cn';
}

export const request = new Api();

export const sysRequest = new SystemApi();
