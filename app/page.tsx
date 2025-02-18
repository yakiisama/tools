import Link from 'next/link';

function Icon({ className }: { className: string }) {
  return <i className={`${className} w-25px h-25px mt-4px`}></i>;
}

export default function Home() {
  const navigation = [
    {
      name: '全民 k 歌',
      description: '下载全民 k 歌中自己唱的歌',
      href: '/ktv',
      icon: <Icon className="i-lucide:mic-vocal"></Icon>,
    },
  ];
  return (
    <div className={`flex flex-col gap-3 text-3xl font-sans`}>
      <div className='flex justify-center text-sm text-black/60'>平常有用的会扔到这里面...</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex gap-5px group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-1"
          >
            {item.icon}
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-black/70 transition-colors">
                {item.name}
              </h3>
              <p className="text-base text-gray-600">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
