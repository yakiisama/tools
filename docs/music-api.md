# 音乐下载功能 - 接口文档

基于 TuneHub V3 API 实现的多平台音乐搜索和下载功能。

## 架构概览

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   前端组件       │────▶│  Next.js API Routes │────▶│  TuneHub V3 API │
│ MusicDownload   │     │  /api/music/*       │     │  tunehub.sayqz  │
└─────────────────┘     └─────────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  上游音乐平台  │
                        │ 网易云/QQ/酷我 │
                        └───────────────┘
```

## 环境变量配置

在 `.env.local` 中配置：

```bash
TUNEHUB_API_KEY=th_your_api_key_here
TUNEHUB_BASE_URL=https://tunehub.sayqz.com/api
```

Vercel 部署时，在项目设置的 Environment Variables 中添加相同变量。

---

## 本地 API 接口

### 1. 聚合搜索

并行搜索三大平台，返回按平台分类的结果。

**请求**

```
GET /api/music/search?keyword=暗号&page=1&pageSize=20
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | ✅ | 搜索关键词 |
| page | number | ❌ | 页码，默认 1 |
| pageSize | number | ❌ | 每页数量，默认 20 |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "keyword": "暗号",
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "platforms": ["netease", "qq", "kuwo"],
    "failedPlatforms": [],
    "resultsByPlatform": {
      "netease": [
        {
          "id": "1974443814",
          "name": "暗号",
          "artist": "周杰伦",
          "album": "八度空间",
          "pic": "https://...",
          "platform": "netease"
        }
      ],
      "qq": [...],
      "kuwo": [...]
    }
  }
}
```

### 2. 歌曲解析

获取歌曲的播放/下载链接。

**请求**

```
POST /api/music/parse
Content-Type: application/json

{
  "platform": "kuwo",
  "id": "535680430",
  "quality": "320k"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | ✅ | 平台：netease / qq / kuwo |
| id | string | ✅ | 歌曲 ID |
| quality | string | ❌ | 音质，默认 320k |

**音质支持表**

| 音质 | 说明 | 网易云 | QQ | 酷我 |
|------|------|:------:|:--:|:----:|
| 128k | 标准 MP3 | ✅ | ✅ | ✅ |
| 320k | 高品质 MP3 | ✅ | ✅ | ✅ |
| flac | 无损 FLAC | ✅ | ✅ | ✅ |
| flac24bit | Hi-Res | ✅ | ✅ | ❌ |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "535680430",
    "name": "暗号",
    "artist": "周杰伦",
    "album": "八度空间",
    "pic": "https://...",
    "url": "http://...mp3",
    "lrc": "[00:00.00]暗号...",
    "quality": "320k"
  }
}
```

---

## TuneHub V3 API 使用说明

### 方法下发机制

TuneHub 采用"方法下发"模式：服务端返回请求配置，客户端自行请求上游平台。

**流程：**

1. 调用 `/v1/methods/:platform/search` 获取搜索方法配置
2. 解析配置中的模板变量（如 `{{keyword}}`）
3. 按配置请求上游音乐平台
4. 使用返回的 `transform` 函数转换数据

**示例：获取 QQ 音乐搜索配置**

```bash
GET https://tunehub.sayqz.com/api/v1/methods/qq/search
X-API-Key: th_your_api_key
```

返回：

```json
{
  "code": 0,
  "data": {
    "type": "http",
    "method": "POST",
    "url": "https://u.y.qq.com/cgi-bin/musicu.fcg",
    "body": {
      "req": {
        "param": {
          "query": "{{keyword}}",
          "page_num": "{{page || 1}}",
          "num_per_page": "{{limit || 20}}"
        }
      }
    },
    "headers": { "Content-Type": "application/json" },
    "transform": "function(response) { ... }"
  }
}
```

### 模板变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{keyword}}` | 搜索关键词 | 暗号 |
| `{{page}}` | 页码 | 1 |
| `{{limit}}` | 每页数量 | 20 |
| `{{page \|\| 1}}` | 带默认值的表达式 | - |

### 解析接口

解析接口消耗积分，用于获取歌曲播放链接。

```bash
POST https://tunehub.sayqz.com/api/v1/parse
X-API-Key: th_your_api_key
Content-Type: application/json

{
  "platform": "netease",
  "ids": "1974443814",
  "quality": "320k"
}
```

**响应结构：**

```json
{
  "code": 0,
  "data": {
    "data": [
      {
        "id": "1974443814",
        "success": true,
        "url": "http://...mp3",
        "info": {
          "name": "暗号",
          "artist": "周杰伦",
          "album": "八度空间"
        },
        "cover": "https://...",
        "lyrics": "[00:00.00]...",
        "actualQuality": "320k"
      }
    ],
    "total": 1,
    "success_count": 1
  }
}
```

---

## 文件结构

```
app/
├── api/
│   ├── music.ts                    # 客户端 API 封装
│   └── music/
│       ├── search/route.ts         # 聚合搜索 API Route
│       └── parse/route.ts          # 歌曲解析 API Route
├── components/
│   └── feature/
│       └── music-download.tsx      # 音乐下载组件
└── music/
    └── page.tsx                    # 音乐下载页面
```

## 错误码

| Code | 说明 |
|------|------|
| 0 | 成功 |
| -1 | 通用错误 |
| -2 | 积分不足 |
| 401 | API Key 无效 |
| 403 | 账户被封禁 |
| 500 | 服务器错误 |

