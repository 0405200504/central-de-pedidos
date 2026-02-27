'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCompany, updateCompany } from '../actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Edit } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar Empresa'}
        </Button>
    )
}

export function CompanyDialog({ company }: { company?: any }) {
    const [open, setOpen] = useState(false)
    const isEditing = !!company
    const [systemType, setSystemType] = useState(company?.system_type || 'web')
    const [remoteTool, setRemoteTool] = useState(company?.remote_tool || 'anydesk')

    async function clientAction(formData: FormData) {
        const result = isEditing ? await updateCompany(company.id, formData) : await createCompany(formData)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(isEditing ? 'Empresa editada com sucesso!' : 'Empresa criada com sucesso!')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Empresa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Altere os dados da empresa.' : 'Cadastre os dados da nova empresa que você representa.'}
                    </DialogDescription>
                </DialogHeader>
                <form action={clientAction}>
                    <div className="grid gap-4 py-4">

                        {/* Dados básicos */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Fantasia *</Label>
                            <Input id="name" name="name" placeholder="Ex: ACME Corp" defaultValue={company?.name || ''} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="legal_name">Razão Social (Opcional)</Label>
                            <Input id="legal_name" name="legal_name" placeholder="Ex: ACME Corporation LTDA" defaultValue={company?.legal_name || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                            <Input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" defaultValue={company?.cnpj || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail (Opcional)</Label>
                            <Input id="email" name="email" type="email" placeholder="contato@acme.com" defaultValue={company?.email || ''} />
                        </div>

                        {/* Tipo de sistema */}
                        <hr className="border-border" />
                        <div className="space-y-2">
                            <Label htmlFor="system_type">Como acessar o sistema desta empresa?</Label>
                            <select
                                id="system_type"
                                name="system_type"
                                value={systemType}
                                onChange={(e) => setSystemType(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            >
                                <option value="web">🌐 Site / Sistema Web (URL)</option>
                                <option value="desktop">🖥️ App Instalado no Computador (Acesso Remoto)</option>
                                <option value="remote">🔗 Link de Sessão (popup externo)</option>
                            </select>
                        </div>

                        {/* Sistema Web */}
                        {systemType === 'web' && (
                            <div className="space-y-2">
                                <Label htmlFor="system_url">URL do Sistema</Label>
                                <Input
                                    id="system_url"
                                    name="system_url"
                                    type="url"
                                    placeholder="https://meu-sistema.com"
                                    defaultValue={company?.system_url || ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    O sistema abrirá dentro do painel. Se o login SSO não funcionar, use o modo "Link de Sessão".
                                </p>
                            </div>
                        )}

                        {/* Sistema Desktop — Acesso Remoto */}
                        {systemType === 'desktop' && (
                            <div className="space-y-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
                                <input type="hidden" name="system_url" value="" />
                                <p className="text-sm font-semibold">Ferramenta de Acesso Remoto</p>
                                <p className="text-xs text-muted-foreground">
                                    Para acessar um sistema instalado no computador, você precisa instalar uma ferramenta de acesso remoto
                                    nesse computador. Escolha a ferramenta e informe o código/ID gerado por ela.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="remote_tool">Ferramenta</Label>
                                    <select
                                        id="remote_tool"
                                        name="remote_tool"
                                        value={remoteTool}
                                        onChange={(e) => setRemoteTool(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="anydesk">⚡ AnyDesk (recomendado)</option>
                                        <option value="chrome_remote">🖥️ Chrome Remote Desktop</option>
                                        <option value="teamviewer">🔌 TeamViewer</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remote_code">
                                        {remoteTool === 'anydesk' && 'ID do AnyDesk'}
                                        {remoteTool === 'chrome_remote' && 'Link ou código de acesso do Chrome Remote Desktop'}
                                        {remoteTool === 'teamviewer' && 'ID do TeamViewer'}
                                    </Label>
                                    <Input
                                        id="remote_code"
                                        name="remote_code"
                                        placeholder={
                                            remoteTool === 'anydesk' ? 'Ex: 123 456 789' :
                                                remoteTool === 'chrome_remote' ? 'Ex: https://remotedesktop.google.com/access/...' :
                                                    'Ex: 123 456 789'
                                        }
                                        defaultValue={company?.remote_code || ''}
                                    />
                                </div>
                                {remoteTool === 'anydesk' && (
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 text-xs space-y-1 border">
                                        <p className="font-semibold">Como configurar o AnyDesk:</p>
                                        <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                                            <li>Baixe o AnyDesk no computador onde o sistema está instalado</li>
                                            <li>Abra o AnyDesk — ele vai mostrar um ID (Ex: 123 456 789)</li>
                                            <li>Ative "Acesso não supervisionado" nas configurações</li>
                                            <li>Cole o ID acima e salve</li>
                                        </ol>
                                        <a href="https://anydesk.com/pt/downloads" target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline inline-block mt-1">
                                            Baixar AnyDesk →
                                        </a>
                                    </div>
                                )}
                                {remoteTool === 'chrome_remote' && (
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 text-xs space-y-1 border">
                                        <p className="font-semibold">Como configurar o Chrome Remote Desktop:</p>
                                        <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                                            <li>Acesse remotedesktop.google.com no computador da empresa</li>
                                            <li>Clique em "Acesso Remoto" → "Ativar"</li>
                                            <li>Instale a extensão quando pedido</li>
                                            <li>Copie o link de acesso gerado e cole acima</li>
                                        </ol>
                                        <a href="https://remotedesktop.google.com/access" target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline inline-block mt-1">
                                            Configurar Chrome Remote Desktop →
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Link de sessão / popup */}
                        {systemType === 'remote' && (
                            <div className="space-y-2">
                                <Label htmlFor="system_url">Link de Acesso</Label>
                                <Input
                                    id="system_url"
                                    name="system_url"
                                    type="url"
                                    placeholder="https://..."
                                    defaultValue={company?.system_url || ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    O link abrirá em uma janela popup flutuante separada do navegador — ideal para sistemas com SSO (Salesforce, etc.) que bloqueiam iframe.
                                </p>
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
