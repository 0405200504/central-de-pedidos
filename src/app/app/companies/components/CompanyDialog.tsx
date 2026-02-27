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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Altere os dados da empresa.' : 'Cadastre os dados da nova empresa que você representa.'}
                    </DialogDescription>
                </DialogHeader>
                <form action={clientAction}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Fantasia *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: ACME Corp"
                                defaultValue={company?.name || ''}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="legal_name">Razão Social (Opcional)</Label>
                            <Input
                                id="legal_name"
                                name="legal_name"
                                placeholder="Ex: ACME Corporation LTDA"
                                defaultValue={company?.legal_name || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                            <Input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" defaultValue={company?.cnpj || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail (Opcional)</Label>
                            <Input id="email" name="email" type="email" placeholder="contato@acme.com" defaultValue={company?.email || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="system_url">URL do Sistema (Opcional)</Label>
                            <Input
                                id="system_url"
                                name="system_url"
                                type="url"
                                placeholder="https://meu-sistema.com"
                                defaultValue={company?.system_url || ''}
                            />
                            <p className="text-xs text-muted-foreground">
                                Cole aqui o link do sistema desta empresa. Ele abrirá diretamente pelo painel lateral.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
