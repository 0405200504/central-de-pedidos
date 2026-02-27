'use client'

import { useAppContext } from '@/components/providers/AppProvider'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, AlertCircle, Monitor, Wifi, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

function DesktopSystemPanel({ company }: { company: any }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 max-w-xl mx-auto text-center px-6">
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                <Monitor className="h-12 w-12 text-blue-500 mx-auto" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
                <p className="text-muted-foreground text-sm">
                    Este é um <strong>sistema instalado no computador</strong> ou aplicativo interno.
                    Não é possível abrir diretamente no navegador, mas você pode acessá-lo remotamente
                    usando uma das ferramentas abaixo.
                </p>
            </div>

            <div className="w-full space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ferramentas de Acesso Remoto
                </p>

                {[
                    {
                        name: 'Chrome Remote Desktop',
                        desc: 'Gratuito pelo Google. Instale no computador da empresa e acesse pelo navegador.',
                        url: 'https://remotedesktop.google.com/',
                        icon: '🖥️',
                        badge: 'Recomendado',
                    },
                    {
                        name: 'AnyDesk',
                        desc: 'Leve e rápido. Baixe no computador da empresa, compartilhe o código de acesso.',
                        url: 'https://anydesk.com/pt/downloads',
                        icon: '⚡',
                        badge: null,
                    },
                    {
                        name: 'TeamViewer',
                        desc: 'Solução corporativa clássica com suporte a múltiplos dispositivos.',
                        url: 'https://www.teamviewer.com/pt/download/',
                        icon: '🔌',
                        badge: null,
                    },
                ].map((tool) => (
                    <a
                        key={tool.name}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl border bg-white dark:bg-zinc-900 hover:border-primary hover:shadow-sm transition-all text-left"
                    >
                        <span className="text-2xl">{tool.icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{tool.name}</span>
                                {tool.badge && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                                        {tool.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                    </a>
                ))}
            </div>

            <p className="text-xs text-muted-foreground border-t w-full pt-4">
                💡 Dica: instale a ferramenta escolhida no computador onde o sistema está instalado,
                configure o acesso e então você poderá abrir o sistema remotamente diretamente aqui.
                Após configurar, edite a empresa e coloque o link de sessão remota como URL do sistema.
            </p>
        </div>
    )
}

function RemoteSystemPanel({ company }: { company: any }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 max-w-xl mx-auto text-center px-6">
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
                <Wifi className="h-12 w-12 text-purple-500 mx-auto" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
                <p className="text-muted-foreground text-sm">
                    Sistema configurado como <strong>Acesso Remoto</strong>.
                    {company.system_url ? ' Clique no botão abaixo para iniciar a sessão.' : ' Nenhum link de acesso foi configurado ainda.'}
                </p>
            </div>
            {company.system_url ? (
                <a
                    href={company.system_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                    Iniciar Sessão Remota
                </a>
            ) : (
                <p className="text-sm text-muted-foreground">Edite a empresa para adicionar o link de sessão.</p>
            )}
        </div>
    )
}

export default function CompanyPortalPage() {
    const { companies } = useAppContext()
    const params = useParams()
    const router = useRouter()
    const [proxyError, setProxyError] = useState(false)

    const company = companies.find((c) => c.id === params.id)

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10" />
                <p>Empresa não encontrada.</p>
                <Button variant="outline" onClick={() => router.push('/app/companies')}>
                    Voltar para Empresas
                </Button>
            </div>
        )
    }

    // Desktop/App system
    if (company.system_type === 'desktop') {
        return (
            <div className="flex flex-col h-full -m-8">
                <div className="flex items-center gap-3 px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-900 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold">{company.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">App Instalado</span>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <DesktopSystemPanel company={company} />
                </div>
            </div>
        )
    }

    // Remote system
    if (company.system_type === 'remote') {
        return (
            <div className="flex flex-col h-full -m-8">
                <div className="flex items-center gap-3 px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-900 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold">{company.name}</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Acesso Remoto</span>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <RemoteSystemPanel company={company} />
                </div>
            </div>
        )
    }

    // No URL
    if (!company.system_url) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
                <h2 className="text-xl font-semibold text-foreground">Nenhum sistema configurado</h2>
                <p className="text-sm max-w-sm text-center">
                    A empresa <strong>{company.name}</strong> ainda não tem uma URL de sistema cadastrada.
                </p>
                <Button variant="outline" onClick={() => router.push('/app/companies')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Editar empresa
                </Button>
            </div>
        )
    }

    // Web system via proxy (strips X-Frame-Options)
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(company.system_url)}`

    return (
        <div className="flex flex-col h-full -m-8">
            {/* Portal topbar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-900 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-semibold shrink-0">{company.name}</span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:block">{company.system_url}</span>
                    {proxyError && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">
                            Bloqueado pelo servidor externo
                        </span>
                    )}
                </div>
                <a
                    href={company.system_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Abrir em nova aba</span>
                </a>
            </div>

            {proxyError ? (
                /* Fallback when proxy also fails */
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-orange-400" />
                    <div>
                        <h2 className="text-xl font-bold mb-2">Sistema bloqueou o acesso embutido</h2>
                        <p className="text-muted-foreground text-sm max-w-md">
                            O servidor de <strong>{company.name}</strong> bloqueia ativamente a exibição
                            dentro de outros sistemas, mesmo via proxy. Isso é uma restrição de segurança
                            do servidor deles que não conseguimos contornar.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href={company.system_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-5 rounded-xl transition-colors hover:opacity-90"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Abrir em nova aba
                        </a>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/app/companies')}
                        >
                            Alterar tipo de sistema
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Dica: configure este sistema como "Acesso Remoto" ou "App Instalado" se ele não for um site público.
                    </p>
                </div>
            ) : (
                <iframe
                    key={proxyUrl}
                    src={proxyUrl}
                    className="flex-1 w-full border-0"
                    title={`Sistema de ${company.name}`}
                    onError={() => setProxyError(true)}
                    allow="fullscreen; camera; microphone"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                />
            )}
        </div>
    )
}
