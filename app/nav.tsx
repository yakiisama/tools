import Link from 'next/link'
import Image from 'next/image'


export default function Navbar() {
  return (
    <div className="shadow-sm fixed w-full z-10  bg-white/75 backdrop-blur-md border-b border-slate-900/10">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex h-16">
          <Link className="flex flex-shrink-0 items-center" href="/">
           <img src="https://www.looyank.cc/_astro/young.CTkkcRXA_2hMNE1.webp" alt='avatar' width={50} height={50} className='rounded-full'/>
          </Link>
        </div>
      </div>
    </div>
  )
}
