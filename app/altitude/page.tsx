import type { Metadata } from 'next'
import AltitudeMeter from '../components/feature/altitude-meter'

/**
 * 页面元数据配置
 */
export const metadata: Metadata = {
  title: '海拔测量 - 实时GPS海拔高度检测',
  description: '使用GPS技术实时测量当前位置的海拔高度，支持单次测量和连续监测功能。',
  keywords: ['海拔测量', 'GPS', '高度检测', '地理位置', '海拔高度'],
}

/**
 * 海拔测量页面
 * 提供实时海拔高度测量功能
 */
export default function AltitudePage() {
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          海拔测量
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          基于GPS技术的实时海拔高度测量工具，随时了解您所在位置的准确海拔信息
        </p>
      </div>

      {/* 海拔测量组件 */}
      <AltitudeMeter />

      {/* 技术说明 */}
      <div className="text-center pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          本工具使用浏览器内置的地理位置API，通过GPS获取海拔数据
        </p>
      </div>
    </div>
  )
}
