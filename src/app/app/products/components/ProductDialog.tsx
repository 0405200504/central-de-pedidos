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
import { createProductAction, updateProductAction } from '../actions'
import { useAppContext } from '@/components/providers/AppProvider'
import { toast } from 'sonner'
import { Plus, Edit } from 'lucide-react'

export function ProductDialog({ product }: { product?: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { activeCompany } = useAppContext()
    const isEditing = !!product

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!activeCompany) {
            toast.error('Nenhuma empresa selecionada.')
            return
        }

        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = isEditing
            ? await updateProductAction(product.id, formData)
            : await createProductAction(formData, activeCompany.id)

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!')
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
                    <Button disabled={!activeCompany}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Produto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do produto. Apenas Nome é obrigatório.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        {/* Informações Básicas */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Produto *</Label>
                            <Input id="name" name="name" placeholder="Ex: Cadeira Gamer" defaultValue={product?.name || ''} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU / Código</Label>
                                <Input id="sku" name="sku" defaultValue={product?.sku || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unidade">Unidade (UN, CX, KG...)</Label>
                                <Input id="unidade" name="unidade" defaultValue={product?.unidade || "UN"} />
                            </div>
                        </div>

                        <Accordion type="multiple" className="w-full">
                            {/* Preços */}
                            <AccordionItem value="precos">
                                <AccordionTrigger>Preços e Custos</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="preco_base">Preço Base (Venda)</Label>
                                            <Input id="preco_base" name="preco_base" type="number" step="0.01" defaultValue={product?.preco_base || ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="custo">Custo</Label>
                                            <Input id="custo" name="custo" type="number" step="0.01" defaultValue={product?.custo || ''} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Fiscal */}
                            <AccordionItem value="fiscal">
                                <AccordionTrigger>Tributário e Fiscal (NCM/CFOP)</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ncm">NCM</Label>
                                            <Input id="ncm" name="ncm" defaultValue={product?.ncm || ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cfop_padrao">CFOP Padrão</Label>
                                            <Input id="cfop_padrao" name="cfop_padrao" defaultValue={product?.cfop_padrao || ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="aliquota_icms">Alíquota ICMS (%)</Label>
                                            <Input id="aliquota_icms" name="aliquota_icms" type="number" step="0.01" defaultValue={product?.aliquota_icms || ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="aliquota_ipi">Alíquota IPI (%)</Label>
                                            <Input id="aliquota_ipi" name="aliquota_ipi" type="number" step="0.01" defaultValue={product?.aliquota_ipi || ''} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Estoque */}
                            <AccordionItem value="estoque">
                                <AccordionTrigger>Estoque e Peso</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="peso_bruto">Peso Bruto</Label>
                                            <Input id="peso_bruto" name="peso_bruto" type="number" step="0.001" defaultValue={product?.peso_bruto || ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="estoque_atual">Estoque Atual</Label>
                                            <Input id="estoque_atual" name="estoque_atual" type="number" step="1" defaultValue={product?.estoque_atual || ''} />
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
                            {loading ? 'Salvando...' : 'Salvar Produto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
