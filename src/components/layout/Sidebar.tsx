'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/components/providers/AppProvider'
import { Building2, Settings, ExternalLink, ChevronRight } from 'lucide-react'

const bottomNav = [
    { name: 'Empresas', href: '/app/companies', icon: Building2 },
    { name: 'Configurações', href: '/app/settings', icon: Settings },
]

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
}

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { companies } = useAppContext()

    return (
        <div className="flex h-full w-64 flex-col bg-transparent">
            {/* Logo */}
            <div className="flex h-20 shrink-0 items-center px-6">
                <span className="text-xl font-bold tracking-tight">Central de Pedidos</span>
            </div>

            {/* Companies Section */}
            <div className="px-4 mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 px-2 mb-2">
                    Minhas Empresas
                </p>

                {companies.length === 0 ? (
                    <div className="text-xs text-zinc-400 px-2 py-3 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-center">
                        Nenhuma empresa cadastrada ainda.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {companies.map((company) => {
                            const portalHref = `/app/companies/${company.id}/portal`
                            const isActive = pathname.startsWith(portalHref)
                            const hasSystem = !!company.system_url

                            return (
                                <button
                                    key={company.id}
                                    onClick={() => {
                                        if (hasSystem) {
                                            router.push(portalHref)
                                        } else {
                                            router.push('/app/companies')
                                        }
                                    }}
                                    title={hasSystem ? `Abrir sistema de ${company.name}` : `${company.name} (sem URL de sistema)`}
                                    className={cn(
                                        'group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left',
                                        isActive
                                            ? 'bg-zinc-900 text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900'
                                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                                    )}
                                >
                                    {/* Avatar / Initials */}
                                    <div className={cn(
                                        'h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0',
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                                    )}>
                                        {company.logo_url
                                            ? <img src={company.logo_url} alt={company.name} className="h-7 w-7 rounded-lg object-cover" />
                                            : getInitials(company.name)
                                        }
                                    </div>

                                    {/* Name */}
                                    <span className="flex-1 truncate text-xs">{company.name}</span>

                                    {/* Indicator */}
                                    {hasSystem ? (
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-30" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom Nav */}
            <nav className="space-y-1 px-4 py-4 border-t border-zinc-100 dark:border-zinc-800">
                {bottomNav.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center gap-x-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-zinc-900 text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-5 w-5 shrink-0 transition-colors',
                                    isActive
                                        ? 'text-white dark:text-zinc-900'
                                        : 'text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
