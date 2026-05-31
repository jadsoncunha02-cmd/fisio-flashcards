'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/questoes', label: 'Questões' },
  { href: '/simulado', label: 'Simulado' },
  { href: '/resultados', label: 'Resultados' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="ff-navbar">
      <Link href="/" className="ff-logo">
        Fisio<span>Flash</span>
      </Link>
      <div className="ff-nav-links">
        {LINKS.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`ff-nav-link${active ? ' active' : ''}`}>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
