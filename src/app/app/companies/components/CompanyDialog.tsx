'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCompany, updateCompany } from '../actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Edit, CheckCircle, XCircle, Loader2 } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</> : 'Salvar Empresa'}
        </Button>
    )
}

// Gera e faz download do arquivo .rdp
function downloadRdp(host: string, port: string, user: string, companyName: string) {
    const portNum = port || '3389'
    const content = [
        `full address:s:${host}:${portNum}`,
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

export function CompanyDialog({ company }: { company?: any }) {
    const [open, setOpen] = useState(false)
    const isEditing = !!company

    const [accessType, setAccessType] = useState<'web' | 'rdp'>(
        company?.system_type === 'rdp' ? 'rdp' : 'web'
    )
    const [openInNewTab, setOpenInNewTab] = useState(company?.open_in_new_tab ?? false)
    const [urlStatus, setUrlStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

    // RDP fields state (for download on-the-fly)
    const [rdpHost, setRdpHost] = useState(company?.rdp_host || '')
    const [rdpPort, setRdpPort] = useState(company?.rdp_port?.toString() || '3389')
    const [rdpUser, setRdpUser] = useState(company?.rdp_user || '')
    const [companyName, setCompanyName] = useState(company?.name || '')

    async function testUrl(e: React.MouseEvent) {
        e.preventDefault()
        const urlInput = (document.getElementById('system_url') as HTMLInputElement)?.value
        if (!urlInput) { toast.error('Digite uma URL primeiro'); return }
        setUrlStatus('loading')
        try {
            new URL(urlInput) // validate format
            const res = await fetch(`/api/proxy?url=${encodeURIComponent(urlInput)}`, { method: 'GET' })
            setUrlStatus(res.ok ? 'ok' : 'error')
        } catch {
            setUrlStatus('error')
        }
    }

    async function clientAction(formData: FormData) {
        const result = isEditing
            ? await updateCompany(company.id, formData)
            : await createCompany(formData)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(isEditing ? 'Empresa atualizada!' : 'Empresa criada!')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                ) : (
                    <Button><Plus className="mr-2 h-4 w-4" />Nova Empresa</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
                </DialogHeader>
                <form action={clientAction}>
                    <div className="grid gap-4 py-4">

                        {/* Nome */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nome da Empresa *</Label>
                            <Input
                                id="name" name="name" required
                                placeholder="Ex: ACME Corp"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                defaultValue={company?.name || ''}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" defaultValue={company?.cnpj || ''} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" name="email" type="email" placeholder="contato@empresa.com" defaultValue={company?.email || ''} />
                            </div>
                        </div>

                        {/* Tipo de Acesso */}
                        <div className="space-y-2 pt-2">
                            <Label>Tipo de Acesso</Label>
                            <div className="flex flex-col gap-2">
                                {/* Web */}
                                <label className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${accessType === 'web' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                                    <input
                                        type="radio" name="system_type" value="web"
                                        className="mt-0.5 accent-primary"
                                        checked={accessType === 'web'}
                                        onChange={() => setAccessType('web')}
                                    />
                                    <div>
                                        <p className="font-medium text-sm">🌐 Sistema Web (URL)</p>
                                        <p className="text-xs text-muted-foreground">Abre o sistema dentro do painel via link</p>
                                    </div>
                                </label>
                                {/* RDP */}
                                <label className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${accessType === 'rdp' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                                    <input
                                        type="radio" name="system_type" value="rdp"
                                        className="mt-0.5 accent-primary"
                                        checked={accessType === 'rdp'}
                                        onChange={() => setAccessType('rdp')}
                                    />
                                    <div>
                                        <p className="font-medium text-sm">🖥️ Acesso Remoto (RDP)</p>
                                        <p className="text-xs text-muted-foreground">Gera arquivo .rdp para conectar via Remote Desktop</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Campos: Sistema Web */}
                        {accessType === 'web' && (
                            <div className="space-y-3 border rounded-xl p-4 bg-muted/30">
                                <div className="space-y-1.5">
                                    <Label htmlFor="system_url">URL do Sistema</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="system_url" name="system_url" type="url"
                                            placeholder="https://sistema.empresa.com"
                                            defaultValue={company?.system_url || ''}
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={testUrl} className="shrink-0">
                                            {urlStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                                urlStatus === 'ok' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                                                    urlStatus === 'error' ? <XCircle className="h-4 w-4 text-red-500" /> :
                                                        'Testar'}
                                        </Button>
                                    </div>
                                    {urlStatus === 'ok' && <p className="text-xs text-green-600">✓ URL acessível</p>}
                                    {urlStatus === 'error' && <p className="text-xs text-red-500">✗ URL inacessível ou bloqueada (pode funcionar mesmo assim)</p>}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox" name="open_in_new_tab" value="true"
                                        checked={openInNewTab}
                                        onChange={e => setOpenInNewTab(e.target.checked)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm">Abrir em nova aba (para sistemas com SSO/login próprio)</span>
                                </label>
                            </div>
                        )}

                        {/* Campos: RDP */}
                        {accessType === 'rdp' && (
                            <div className="space-y-3 border rounded-xl p-4 bg-muted/30">
                                <input type="hidden" name="system_url" value="" />
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2 space-y-1.5">
                                        <Label htmlFor="rdp_host">IP ou Host *</Label>
                                        <Input
                                            id="rdp_host" name="rdp_host" required={accessType === 'rdp'}
                                            placeholder="192.168.1.100"
                                            value={rdpHost}
                                            onChange={e => setRdpHost(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="rdp_port">Porta</Label>
                                        <Input
                                            id="rdp_port" name="rdp_port"
                                            placeholder="3389"
                                            value={rdpPort}
                                            onChange={e => setRdpPort(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="rdp_user">Usuário (opcional)</Label>
                                    <Input
                                        id="rdp_user" name="rdp_user"
                                        placeholder="Ex: Administrador"
                                        value={rdpUser}
                                        onChange={e => setRdpUser(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    🔒 A senha não é armazenada. Será solicitada pelo Remote Desktop ao conectar.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        if (!rdpHost) { toast.error('Informe o IP ou Host'); return }
                                        downloadRdp(rdpHost, rdpPort, rdpUser, companyName || 'empresa')
                                    }}
                                >
                                    ⬇️ Gerar Arquivo de Conexão (.rdp)
                                </Button>
                            </div>
                        )}

                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
