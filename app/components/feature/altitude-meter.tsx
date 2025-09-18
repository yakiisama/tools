'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

/**
 * 海拔测量数据类型
 */
interface AltitudeData {
  altitude: number | null
  accuracy: number | null
  timestamp: number
  latitude: number | null
  longitude: number | null
}

/**
 * 海拔测量组件
 * 使用 Geolocation API 获取实时位置和海拔信息
 */
export default function AltitudeMeter() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [altitudeData, setAltitudeData] = React.useState<AltitudeData | null>(null)
  const [watchId, setWatchId] = React.useState<number | null>(null)
  const [isWatching, setIsWatching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  /**
   * 检查浏览器是否支持地理位置 API
   */
  const isGeolocationSupported = React.useMemo(() => {
    return 'geolocation' in navigator
  }, [])

  /**
   * 格式化海拔高度显示
   */
  const formatAltitude = (altitude: number | null) => {
    if (altitude === null) return '--'
    return `${Math.round(altitude)} 米`
  }

  /**
   * 格式化精度显示
   */
  const formatAccuracy = (accuracy: number | null) => {
    if (accuracy === null) return '--'
    return `±${Math.round(accuracy)} 米`
  }

  /**
   * 处理地理位置成功回调
   */
  const handleSuccess = React.useCallback((position: GeolocationPosition) => {
    const { coords, timestamp } = position
    
    // 调试信息
    console.log('位置信息获取成功：', {
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      accuracy: coords.accuracy,
      heading: coords.heading,
      speed: coords.speed
    })
    
    setAltitudeData({
      altitude: coords.altitude,
      accuracy: coords.altitudeAccuracy,
      timestamp,
      latitude: coords.latitude,
      longitude: coords.longitude
    })
    
    setError(null)
    setIsLoading(false)
    
    if (coords.altitude !== null && coords.altitude !== 0) {
      toast.success(`海拔高度：${formatAltitude(coords.altitude)}`)
    } else if (coords.altitude === 0) {
      toast.warning('海拔显示为 0 米，可能是设备定位精度限制')
    } else {
      toast.warning('设备不支持海拔测量，请在支持 GPS 的移动设备上使用')
    }
  }, [])

  /**
   * 处理地理位置错误回调
   */
  const handleError = React.useCallback((error: GeolocationPositionError) => {
    setIsLoading(false)
    setIsWatching(false)
    
    let errorMessage = '获取位置信息失败'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '用户拒绝了位置访问请求'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = '位置信息不可用'
        break
      case error.TIMEOUT:
        errorMessage = '获取位置信息超时'
        break
      default:
        errorMessage = '未知错误'
        break
    }
    
    setError(errorMessage)
    toast.error(errorMessage)
  }, [])

  /**
   * 获取单次海拔测量
   */
  const getCurrentPosition = React.useCallback(() => {
    if (!isGeolocationSupported) {
      toast.error('您的浏览器不支持地理位置功能')
      return
    }

    setIsLoading(true)
    setError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true, // 启用高精度
      timeout: 10000, // 10 秒超时
      maximumAge: 60000 // 缓存 1 分钟
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    )
  }, [isGeolocationSupported, handleSuccess, handleError])

  /**
   * 开始实时监测
   */
  const startWatching = React.useCallback(() => {
    if (!isGeolocationSupported) {
      toast.error('您的浏览器不支持地理位置功能')
      return
    }

    setIsWatching(true)
    setError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000
    }

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    )

    setWatchId(id)
    toast.success('开始实时监测海拔高度')
  }, [isGeolocationSupported, handleSuccess, handleError])

  /**
   * 停止实时监测
   */
  const stopWatching = React.useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsWatching(false)
    toast.info('已停止实时监测')
  }, [watchId])

  /**
   * 组件卸载时清理监听
   */
  React.useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  /**
   * 检测设备类型和定位能力
   */
  const getDeviceInfo = React.useMemo(() => {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isSecureContext: false,
        hasGeolocation: false,
        deviceType: '未知设备',
        gpsSupport: '未知',
        altitudeSupport: '未知'
      }
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:'
    
    return {
      isMobile,
      isSecureContext,
      hasGeolocation: 'geolocation' in navigator,
      deviceType: isMobile ? '移动设备' : '桌面设备',
      gpsSupport: isMobile ? '通常支持' : '通常不支持',
      altitudeSupport: isMobile ? '支持' : '不支持或不准确'
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* 设备兼容性提示卡片 */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <i className="i-lucide:info w-5 h-5" />
            设备兼容性检测
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <i className={`w-4 h-4 ${getDeviceInfo.isMobile ? 'i-lucide:smartphone text-green-500' : 'i-lucide:monitor text-orange-500'}`} />
              <span className="text-muted-foreground">设备类型：</span>
              <span className="font-medium">{getDeviceInfo.deviceType}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className={`w-4 h-4 ${getDeviceInfo.isMobile ? 'i-lucide:satellite text-green-500' : 'i-lucide:wifi text-orange-500'}`} />
              <span className="text-muted-foreground">GPS 支持：</span>
              <span className={`font-medium ${getDeviceInfo.isMobile ? 'text-green-600' : 'text-orange-600'}`}>
                {getDeviceInfo.gpsSupport}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <i className={`w-4 h-4 ${getDeviceInfo.isMobile ? 'i-lucide:mountain text-green-500' : 'i-lucide:x-circle text-red-500'}`} />
              <span className="text-muted-foreground">海拔测量：</span>
              <span className={`font-medium ${getDeviceInfo.isMobile ? 'text-green-600' : 'text-red-600'}`}>
                {getDeviceInfo.altitudeSupport}
              </span>
            </div>
          </div>
          {!getDeviceInfo.isMobile && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-md">
              <div className="flex items-start gap-2">
                <i className="i-lucide:alert-triangle w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <p className="font-medium">当前为桌面设备</p>
                  <p className="mt-1">
                    桌面设备通常使用 WiFi/IP 定位，无法提供准确的海拔数据。
                    为获得最佳体验，建议在手机或平板设备上使用此功能。
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 主要测量卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="i-lucide:mountain w-5 h-5 text-primary" />
            海拔高度测量
          </CardTitle>
          <CardDescription>
            使用设备 GPS 获取当前位置的海拔高度信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 测量结果显示 */}
          {altitudeData && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                    altitudeData.altitude === null || altitudeData.altitude === 0 
                      ? 'text-yellow-600' 
                      : 'text-primary'
                  }`}>
                    {formatAltitude(altitudeData.altitude)}
                  </div>
                  <div className="text-sm text-muted-foreground">海拔高度</div>
                  {(altitudeData.altitude === null || altitudeData.altitude === 0) && (
                    <div className="text-xs text-yellow-600 mt-1">
                      <i className="i-lucide:alert-triangle w-3 h-3 inline mr-1" />
                      数据不可用
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-semibold text-muted-foreground mb-2">
                    {formatAccuracy(altitudeData.accuracy)}
                  </div>
                  <div className="text-sm text-muted-foreground">测量精度</div>
                </div>
              </div>
              
              {/* 详细信息 */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="i-lucide:map-pin w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      经度：{altitudeData.longitude?.toFixed(6) || '--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="i-lucide:compass w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      纬度：{altitudeData.latitude?.toFixed(6) || '--'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <i className="i-lucide:clock w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    更新时间：{new Date(altitudeData.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 错误信息显示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <i className="i-lucide:alert-circle w-5 h-5" />
                <span className="font-medium">测量失败</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={getCurrentPosition}
              disabled={isLoading || !isGeolocationSupported}
              size="lg"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <i className="i-lucide:loader-2 w-4 h-4 mr-2 animate-spin" />
                  测量中...
                </>
              ) : (
                <>
                  <i className="i-lucide:target w-4 h-4 mr-2" />
                  {getDeviceInfo.isMobile ? '测量海拔' : '尝试定位'}
                </>
              )}
            </Button>

            {!isWatching ? (
              <Button
                onClick={startWatching}
                disabled={isLoading || !isGeolocationSupported}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <i className="i-lucide:eye w-4 h-4 mr-2" />
                {getDeviceInfo.isMobile ? '实时监测' : '监测位置'}
              </Button>
            ) : (
              <Button
                onClick={stopWatching}
                variant="destructive"
                size="lg"
                className="flex-1"
              >
                <i className="i-lucide:square w-4 h-4 mr-2" />
                停止监测
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 使用说明卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="i-lucide:info w-5 h-5 text-blue-500" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <i className="i-lucide:check-circle w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                点击 <strong>"测量海拔"</strong> 获取当前位置的海拔高度
              </span>
            </div>
            <div className="flex items-start gap-2">
              <i className="i-lucide:check-circle w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                使用 <strong>"实时监测"</strong> 功能可持续跟踪海拔变化
              </span>
            </div>
            <div className="flex items-start gap-2">
              <i className="i-lucide:alert-triangle w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>
                首次使用需要授权浏览器访问位置信息
              </span>
            </div>
            <div className="flex items-start gap-2">
              <i className="i-lucide:monitor w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>桌面设备限制：</strong>台式机和笔记本电脑通常没有 GPS 芯片，可能显示 0 米或无法获取海拔数据
              </span>
            </div>
            <div className="flex items-start gap-2">
              <i className="i-lucide:smartphone w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>最佳体验：</strong>在配备 GPS 的手机或平板设备上使用效果最佳
              </span>
            </div>
            <div className="flex items-start gap-2">
              <i className="i-lucide:signal w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>
                测量精度受 GPS 信号强度和设备性能影响，建议在室外空旷环境下使用
              </span>
            </div>
            <div className="flex items-start gap-2">
              <i className="i-lucide:wifi w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>
                桌面设备使用 WiFi/IP 定位，主要提供经纬度信息，海拔数据通常不准确
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
