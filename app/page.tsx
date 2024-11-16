
export default function Home() {
  const navigation = [
    { name: '全民 k 歌', description: '下载全民 k 歌中自己唱的歌', href: '/ktv' },
    { name: '歌曲搜索', description: '不知名来源歌曲搜索下载', href: '/song' },
  ]
  return (
    <div className={`flex flex-col gap-3 text-3xl font-sans`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-1"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-base text-gray-600">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
