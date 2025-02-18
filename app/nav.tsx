import Link from 'next/link'
import Image from 'next/image'
import { HomeIcon } from './icons/home'


export default function Navbar() {
  return (
    <div className="shadow-sm fixed w-full z-10  bg-white/75 backdrop-blur-md border-b border-slate-900/10">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex h-16">
          <Link className="flex flex-shrink-0 items-center" href="/">
           <HomeIcon/>
          </Link>
        </div>
      </div>
    </div>
  )
}
