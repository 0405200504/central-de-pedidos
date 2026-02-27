'use client'

import { useAppContext } from '@/components/providers/AppProvider'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, AlertCircle, Monitor, RefreshCw, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

// ── Popup helper ───────────────────────────────────────────────────────────────
function openPopup(url: string, title: string) {
    const w = window.screen.width * 0.85
    const h = window.screen.height * 0.9
    const left = window.screen.width / 2 - w / 2
    const top = window.screen.height / 2 - h / 2
    window.open(url, title, `width=${Math.round(w)},height=${Math.round(h)},top=${Math.round(top)},left=${Math.round(left)},resizable=yes,scrollbars=yes,toolbar=yes`)
}

// ── .rdp download ─────────────────────────────────────────────────────────────
function downloadRdp(host: string, port: number, user: string, companyName: string) {
    const content = [
        `full address:s:${host}:${port || 3389}`,
        `username:s:${user || ''}`,
        `prompt for credentials:i:1`,
        `authentication level:i:2`,
        `connection type:i:7`,
        `networkautodetect:i:1`,
        `bandwidthautodetect:i:1`,
        `session bpp:i:32`,
        `desktopwidth:i:1920`,
        `desktopheight:i:1080`,
    ].join('\r\n')

    const blob = new Blob([content], { type: 'application/x-rdp' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${companyName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.rdp`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// ── Portal Topbar ─────────────────────────────────────────────────────────────
function PortalBar({ company, badge, badgeColor, extra }: {
    company: any; badge?: string; badgeColor?: string; extra?: React.ReactNode
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
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${badgeColor}`}>{badge}</span>
                )}
            </div>
            {extra}
        </div>
    )
}

// ── RDP Panel ─────────────────────────────────────────────────────────────────
function RdpPanel({ company }: { company: any }) {
    const host = company.rdp_host || ''
    const port = company.rdp_port || 3389
    const user = company.rdp_user || ''

    function copyIp() {
        navigator.clipboard.writeText(`${host}:${port}`)
        toast.success('IP copiado!')
    }

    return (
        <div className="flex flex-col h-full -m-8">
            <PortalBar company={company} badge="Acesso Remoto (RDP)" badgeColor="bg-blue-100 text-blue-700" />
            <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-lg mx-auto text-center px-6 py-10">
                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
                    <Monitor className="h-12 w-12 text-blue-500 mx-auto" />
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-1">{company.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        Conexão via Remote Desktop Protocol (RDP)
                    </p>
                </div>

                {host ? (
                    <>
                        {/* Info da conexão */}
                        <div className="w-full grid grid-cols-2 gap-3">
                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-left border">
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Host / IP</p>
                                <p className="font-mono font-bold text-sm">{host}</p>
                            </div>
                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-left border">
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Porta</p>
                                <p className="font-mono font-bold text-sm">{port}</p>
                            </div>
                            {user && (
                                <div className="col-span-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-left border">
                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Usuário</p>
                                    <p className="font-mono font-bold text-sm">{user}</p>
                                </div>
                            )}
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-3 w-full">
                            <Button
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => downloadRdp(host, port, user, company.name)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar Arquivo RDP
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full"
                                onClick={copyIp}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar IP ({host}:{port})
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground border-t w-full pt-4 space-y-1">
                            <p>💡 Abra o arquivo .rdp baixado para iniciar a conexão Remote Desktop.</p>
                            <p>🔒 A senha não é armazenada — será solicitada pelo Windows ao conectar.</p>
                        </div>
                    </>
                ) : (
                    <div className="w-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 rounded-xl p-4 text-sm text-center">
                        Nenhum host configurado. Edite a empresa para adicionar o IP/Host.
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Main Portal ───────────────────────────────────────────────────────────────
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

    // ── Acesso Remoto RDP ─────────────────────────────────────────────────────
    if (company.system_type === 'rdp') {
        return <RdpPanel company={company} />
    }

    // ── Sem URL configurada ───────────────────────────────────────────────────
    if (!company.system_url) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
                <h2 className="text-xl font-semibold text-foreground">Nenhum sistema configurado</h2>
                <p className="text-sm max-w-xs text-center">
                    Edite a empresa e adicione a URL do sistema.
                </p>
                <Button variant="outline" onClick={() => router.push('/app/companies')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />Editar empresa
                </Button>
            </div>
        )
    }

    // ── Sistema Web: nova aba ─────────────────────────────────────────────────
    if (company.open_in_new_tab) {
        return (
            <div className="flex flex-col h-full -m-8">
                <PortalBar
                    company={company}
                    badge="Sistema Web"
                    badgeColor="bg-zinc-100 text-zinc-600"
                />
                <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center px-6">
                    <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border">
                        <ExternalLink className="h-10 w-10 text-zinc-500 mx-auto" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-1">{company.name}</h2>
                        <p className="text-sm text-muted-foreground">{company.system_url}</p>
                    </div>
                    <Button
                        size="lg"
                        className="w-full max-w-xs"
                        onClick={() => openPopup(company.system_url!, company.name)}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir {company.name}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Abrirá em uma janela popup — recomendado para sistemas com SSO (Salesforce, etc.)
                    </p>
                </div>
            </div>
        )
    }

    // ── Sistema Web: iframe direto ─────────────────────────────────────────
    return (
        <div className="flex flex-col h-full -m-8 relative group">
            <PortalBar
                company={company}
                badge="Sistema Web"
                badgeColor="bg-zinc-100 text-zinc-600"
                extra={
                    <div className="flex items-center gap-2">
                        <button onClick={handleReload} title="Recarregar"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                }
            />

            {/* Banner de fallback caso a tela fique branca (site bloqueando iframe) */}
            <div className="absolute top-[60px] left-0 right-0 bg-yellow-50 dark:bg-yellow-950/40 border-b border-yellow-200 dark:border-yellow-900/50 p-3 text-center flex items-center justify-center gap-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-yellow-800 dark:text-yellow-200">
                    A tela ficou em branco? O sistema {company.name} pode ter bloqueado o acesso embutido.
                </span>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-white text-black" onClick={() => openPopup(company.system_url!, company.name)}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Abrir em nova janela
                </Button>
            </div>

            <iframe
                key={`${company.system_url}-${reloadKey}`}
                src={company.system_url}
                className="flex-1 w-full border-0 bg-white"
                title={`Sistema de ${company.name}`}
                allow="fullscreen; camera; microphone; clipboard-read; clipboard-write"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            />
        </div>
    )
}
