'use client'

import { useAppContext } from '@/components/providers/AppProvider'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, AlertCircle, Monitor, Wifi, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useCallback } from 'react'

// ─── Popup Helper ────────────────────────────────────────────────────────────
function openPopup(url: string, title: string) {
    const w = window.screen.width * 0.8
    const h = window.screen.height * 0.85
    const left = window.screen.width / 2 - w / 2
    const top = window.screen.height / 2 - h / 2
    window.open(
        url,
        title,
        `width=${Math.round(w)},height=${Math.round(h)},top=${Math.round(top)},left=${Math.round(left)},resizable=yes,scrollbars=yes,status=yes,toolbar=yes`
    )
}

// ─── Portal Topbar ────────────────────────────────────────────────────────────
function PortalBar({ company, badge, badgeColor, extra }: {
    company: any
    badge?: string
    badgeColor?: string
    extra?: React.ReactNode
}) {
    const router = useRouter()
    return (
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-900 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-semibold shrink-0">{company.name}</span>
                {badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
            {extra}
        </div>
    )
}

// ─── Desktop / App Instalado ──────────────────────────────────────────────────
function DesktopPanel({ company }: { company: any }) {
    const router = useRouter()
    const remoteTool = company.remote_tool || 'anydesk'
    const remoteCode = company.remote_code

    const tools: Record<string, { label: string; icon: string; embedFn?: () => string | null; setupUrl: string; setupSteps: string[] }> = {
        anydesk: {
            label: 'AnyDesk',
            icon: '⚡',
            embedFn: () => remoteCode ? null : null, // AnyDesk web opens its own portal
            setupUrl: 'https://anydesk.com/pt/downloads',
            setupSteps: [
                'Baixe o AnyDesk no computador onde o sistema está instalado',
                'Abra o AnyDesk — ele mostrará um ID numérico (ex: 123 456 789)',
                'Ative "Acesso não supervisionado" nas configurações do AnyDesk',
                'Salve o ID acima no cadastro da empresa',
            ],
        },
        chrome_remote: {
            label: 'Chrome Remote Desktop',
            icon: '🖥️',
            setupUrl: 'https://remotedesktop.google.com/access',
            setupSteps: [
                'Acesse remotedesktop.google.com no computador da empresa',
                'Clique em "Acesso Remoto" e depois em "Ativar"',
                'Instale a extensão quando solicitado',
                'Anote o PIN criado e salve no cadastro da empresa',
            ],
        },
        teamviewer: {
            label: 'TeamViewer',
            icon: '🔌',
            setupUrl: 'https://www.teamviewer.com/pt/download/',
            setupSteps: [
                'Baixe o TeamViewer no computador da empresa',
                'Abra o TeamViewer — ele mostrará um ID e senha',
                'Salve o ID e a senha no cadastro',
            ],
        },
    }

    const tool = tools[remoteTool] || tools.anydesk

    // AnyDesk webclient embed
    if (remoteTool === 'anydesk') {
        return (
            <div className="flex flex-col h-full -m-8">
                <PortalBar
                    company={company}
                    badge="App Instalado · AnyDesk"
                    badgeColor="bg-yellow-100 text-yellow-700"
                    extra={
                        <a
                            href="https://v.anydesk.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Nova aba
                        </a>
                    }
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {remoteCode ? (
                        <>
                            <div className="px-5 py-2 bg-yellow-50 dark:bg-yellow-950/20 border-b text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                                <span>⚡ ID AnyDesk cadastrado: <strong>{remoteCode}</strong> — insira-o no campo abaixo para conectar.</span>
                            </div>
                            <iframe
                                src="https://v.anydesk.com/"
                                className="flex-1 w-full border-0"
                                title="AnyDesk Web"
                                allow="fullscreen; camera; microphone"
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center max-w-xl mx-auto py-10">
                            <div className="p-5 rounded-2xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900">
                                <Monitor className="h-12 w-12 text-yellow-500 mx-auto" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2">Configure o AnyDesk primeiro</h2>
                                <p className="text-sm text-muted-foreground">Siga os passos abaixo no computador onde o sistema está instalado:</p>
                            </div>
                            <ol className="text-sm text-left space-y-2 w-full max-w-sm">
                                {tool.setupSteps.map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="h-6 w-6 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                        <span className="text-muted-foreground text-xs pt-1">{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <div className="flex gap-3">
                                <a
                                    href={tool.setupUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Baixar AnyDesk
                                </a>
                                <Button variant="outline" onClick={() => router.push('/app/companies')}>
                                    Salvar ID cadastrado
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // TeamViewer web
    if (remoteTool === 'teamviewer') {
        return (
            <div className="flex flex-col h-full -m-8">
                <PortalBar company={company} badge="App Instalado · TeamViewer" badgeColor="bg-blue-100 text-blue-700" />
                <iframe
                    src="https://web.teamviewer.com/"
                    className="flex-1 w-full border-0"
                    title="TeamViewer Web"
                    allow="fullscreen; camera; microphone"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
            </div>
        )
    }

    // Chrome Remote Desktop
    return (
        <div className="flex flex-col h-full -m-8">
            <PortalBar
                company={company}
                badge="App Instalado · Chrome Remote Desktop"
                badgeColor="bg-green-100 text-green-700"
                extra={
                    <Button
                        size="sm"
                        onClick={() => openPopup('https://remotedesktop.google.com/access', 'Chrome Remote Desktop')}
                    >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Abrir Chrome Remote Desktop
                    </Button>
                }
            />
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center max-w-xl mx-auto py-10">
                <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900">
                    <Monitor className="h-12 w-12 text-green-500 mx-auto" />
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-2">Chrome Remote Desktop</h2>
                    <p className="text-sm text-muted-foreground">
                        O Chrome Remote Desktop requer autenticação Google e não pode ser embutido diretamente.
                        Clique no botão abaixo para abrir em uma janela popup.
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={() => openPopup('https://remotedesktop.google.com/access', 'Chrome Remote Desktop')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir em Janela Popup
                </Button>
                {remoteCode && (
                    <p className="text-xs text-muted-foreground bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 py-3">
                        💡 PIN salvo: <strong>{remoteCode}</strong>
                    </p>
                )}
            </div>
        </div>
    )
}

// ─── Main Portal Page ─────────────────────────────────────────────────────────
export default function CompanyPortalPage() {
    const { companies } = useAppContext()
    const params = useParams()
    const router = useRouter()
    const [proxyFailed, setProxyFailed] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)

    const company = companies.find((c) => c.id === params.id)

    const handleReload = useCallback(() => {
        setProxyFailed(false)
        setReloadKey(k => k + 1)
    }, [])

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10" />
                <p>Empresa não encontrada.</p>
                <Button variant="outline" onClick={() => router.push('/app/companies')}>Voltar</Button>
            </div>
        )
    }

    // ── Desktop / App Instalado ───────────────────────────────────────────────
    if (company.system_type === 'desktop') {
        return <DesktopPanel company={company} />
    }

    // ── Acesso Remoto / Popup ─────────────────────────────────────────────────
    if (company.system_type === 'remote') {
        return (
            <div className="flex flex-col h-full -m-8">
                <PortalBar
                    company={company}
                    badge="Sessão Remota"
                    badgeColor="bg-purple-100 text-purple-700"
                />
                <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-lg mx-auto text-center px-6">
                    <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-900">
                        <Wifi className="h-12 w-12 text-purple-500 mx-auto" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
                        <p className="text-sm text-muted-foreground">
                            Sistema configurado como <strong>Sessão Remota</strong> (Salesforce, ERP com SSO, etc.).
                            Abrirá em uma janela popup separada para que o login funcione corretamente.
                        </p>
                    </div>
                    {company.system_url ? (
                        <Button
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => openPopup(company.system_url!, company.name)}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir {company.name} em Popup
                        </Button>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Nenhum link configurado. Edite a empresa e adicione a URL.
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground border-t w-full pt-4">
                        💡 Dica: Se for Salesforce, ERP ou qualquer sistema com login SSO, este é o modo correto — o login SSO não funciona dentro de iframes por restrições de segurança do navegador.
                    </p>
                </div>
            </div>
        )
    }

    // ── Sem URL configurada ───────────────────────────────────────────────────
    if (!company.system_url) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
                <h2 className="text-xl font-semibold text-foreground">Nenhum sistema configurado</h2>
                <p className="text-sm max-w-sm text-center">
                    A empresa <strong>{company.name}</strong> ainda não tem sistema cadastrado.
                </p>
                <Button variant="outline" onClick={() => router.push('/app/companies')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Editar empresa
                </Button>
            </div>
        )
    }

    // ── Sistema Web via Proxy ─────────────────────────────────────────────────
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(company.system_url)}`

    return (
        <div className="flex flex-col h-full -m-8">
            <PortalBar
                company={company}
                badge="Sistema Web"
                badgeColor="bg-zinc-100 text-zinc-600"
                extra={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReload}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            title="Recarregar"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <a
                            href={company.system_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Nova aba</span>
                        </a>
                    </div>
                }
            />

            {proxyFailed ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center max-w-lg mx-auto">
                    <AlertCircle className="h-12 w-12 text-orange-400" />
                    <div>
                        <h2 className="text-xl font-bold mb-2">Sistema bloqueou o acesso embutido</h2>
                        <p className="text-sm text-muted-foreground">
                            O servidor bloqueia a exibição dentro de outros sistemas por proteção de segurança.
                            Se for um sistema com SSO (Salesforce, ERP, etc.), configure-o como <strong>Sessão Remota</strong>.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                        <Button
                            className="flex-1"
                            onClick={() => openPopup(company.system_url!, company.name)}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir em Popup
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => router.push('/app/companies')}>
                            Alterar tipo
                        </Button>
                    </div>
                </div>
            ) : (
                <iframe
                    key={`${proxyUrl}-${reloadKey}`}
                    src={proxyUrl}
                    className="flex-1 w-full border-0"
                    title={`Sistema de ${company.name}`}
                    onError={() => setProxyFailed(true)}
                    allow="fullscreen; camera; microphone"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                />
            )}
        </div>
    )
}
