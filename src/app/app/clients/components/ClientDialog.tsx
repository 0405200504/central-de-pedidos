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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { createClientAction, updateClientAction } from '../actions'
import { useAppContext } from '@/components/providers/AppProvider'
import { toast } from 'sonner'
import { Plus, Edit } from 'lucide-react'

export function ClientDialog({ client }: { client?: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { activeCompany } = useAppContext()

    const isEdit = !!client

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!activeCompany) {
            toast.error('Nenhuma empresa selecionada.')
            return
        }

        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = isEdit
            ? await updateClientAction(client.id, formData, activeCompany.id)
            : await createClientAction(formData, activeCompany.id)

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(isEdit ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button disabled={!activeCompany}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Cliente
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do cliente. Apenas Nome/Razão Social é obrigatório.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo_pessoa">Tipo de Pessoa *</Label>
                                <select
                                    id="tipo_pessoa"
                                    name="tipo_pessoa"
                                    defaultValue={client?.tipo_pessoa || 'PJ'}
                                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                                    <option value="PF">Pessoa Física (PF)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
                                <Input id="cpf_cnpj" name="cpf_cnpj" placeholder="00.000.000/0001-00" defaultValue={client?.cpf_cnpj} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nome_razao_social">Nome / Razão Social *</Label>
                            <Input
                                id="nome_razao_social"
                                name="nome_razao_social"
                                placeholder="Nome da empresa ou pessoa"
                                required
                                defaultValue={client?.nome_razao_social}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nome_fantasia">Nome Fantasia (Opcional)</Label>
                            <Input id="nome_fantasia" name="nome_fantasia" defaultValue={client?.nome_fantasia} />
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="contato">
                                <AccordionTrigger>Contato</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail</Label>
                                            <Input id="email" name="email" type="email" defaultValue={client?.email} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="telefone">Telefone / Whats</Label>
                                            <Input id="telefone" name="telefone" defaultValue={client?.telefone} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="endereco">
                                <AccordionTrigger>Endereço</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cidade">Cidade</Label>
                                            <Input id="cidade" name="cidade" defaultValue={client?.cidade} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="estado">Estado (UF)</Label>
                                            <Input id="estado" name="estado" maxLength={2} defaultValue={client?.estado} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Salvar Cliente')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
