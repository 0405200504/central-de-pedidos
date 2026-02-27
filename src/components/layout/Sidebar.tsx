'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/components/providers/AppProvider'
import { Building2, Settings, ExternalLink, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'

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
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div
            className={cn(
                'flex h-full flex-col bg-transparent transition-all duration-300 ease-in-out overflow-hidden shrink-0',
                collapsed ? 'w-[60px]' : 'w-64'
            )}
        >
            {/* Logo + toggle */}
            <div className="flex h-20 shrink-0 items-center justify-between px-3">
                {!collapsed && (
                    <span className="text-xl font-bold tracking-tight truncate pl-2">Central de Pedidos</span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0 ml-auto"
                    title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                >
                    {collapsed ? (
                        <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                        <PanelLeftClose className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Companies Section */}
            <div className={cn('mb-2', collapsed ? 'px-1.5' : 'px-4')}>
                {!collapsed && (
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 px-2 mb-2">
                        Minhas Empresas
                    </p>
                )}

                {companies.length === 0 && !collapsed ? (
                    <div className="text-xs text-zinc-400 px-2 py-3 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-center">
                        Nenhuma empresa cadastrada ainda.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {companies.map((company) => {
                            const portalHref = `/app/companies/${company.id}/portal`
                            const isActive = pathname.startsWith(portalHref)
                            const hasSystem = !!company.system_url || company.system_type === 'desktop'

                            return (
                                <button
                                    key={company.id}
                                    onClick={() => router.push(portalHref)}
                                    title={company.name}
                                    className={cn(
                                        'group w-full flex items-center gap-3 text-sm font-medium transition-all duration-200 text-left',
                                        collapsed
                                            ? 'justify-center rounded-xl p-2'
                                            : 'rounded-xl px-3 py-2.5',
                                        isActive
                                            ? 'bg-zinc-900 text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900'
                                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                                    )}
                                >
                                    {/* Avatar / Initials */}
                                    <div className={cn(
                                        'h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0',
                                        isActive
                                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900'
                                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                                    )}>
                                        {company.logo_url
                                            ? <img src={company.logo_url} alt={company.name} className="h-7 w-7 rounded-lg object-cover" />
                                            : getInitials(company.name)
                                        }
                                    </div>

                                    {!collapsed && (
                                        <>
                                            {/* Name */}
                                            <span className="flex-1 truncate text-xs">{company.name}</span>
                                            {/* Indicator */}
                                            {hasSystem ? (
                                                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100" />
                                            ) : (
                                                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-30" />
                                            )}
                                        </>
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
            <nav className={cn(
                'space-y-1 py-4 border-t border-zinc-100 dark:border-zinc-800',
                collapsed ? 'px-1.5' : 'px-4'
            )}>
                {bottomNav.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={collapsed ? item.name : undefined}
                            className={cn(
                                'group flex items-center gap-x-3 transition-all duration-200',
                                collapsed
                                    ? 'justify-center rounded-xl p-2'
                                    : 'rounded-full px-4 py-2.5 text-sm font-medium',
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
                            {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
