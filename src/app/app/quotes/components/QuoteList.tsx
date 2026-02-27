'use client'

import { useState } from 'react'
import { useAppContext } from '@/components/providers/AppProvider'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, FileText, Edit, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { QuoteStatusSelect } from './QuoteStatusSelect'
import { DeleteQuoteButton } from './DeleteQuoteButton'
import { convertQuoteToOrderAction } from '../actions'

export function QuoteList({ initialQuotes }: { initialQuotes: any[] }) {
    const { activeCompany } = useAppContext()
    const [searchTerm, setSearchTerm] = useState('')
    const [loadingPdf, setLoadingPdf] = useState<string | null>(null)
    const [converting, setConverting] = useState<string | null>(null)

    const filteredQuotes = initialQuotes.filter((quote) => {
        if (!activeCompany) return false
        if (quote.company_id !== activeCompany.id) return false

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            const matchClient = quote.clients?.nome_razao_social?.toLowerCase().includes(term)
            return matchClient
        }

        return true
    })

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            accepted: 'bg-green-100 text-green-700',
            sent: 'bg-blue-100 text-blue-700',
            draft: 'bg-gray-100 text-gray-700',
            rejected: 'bg-red-100 text-red-700',
            expired: 'bg-yellow-100 text-yellow-700',
        }
        return map[status] || 'bg-gray-100 text-gray-700'
    }

    const handleGeneratePdf = async (quoteId: string, quoteNumber: number) => {
        if (!activeCompany) return
        setLoadingPdf(quoteId)

        try {
            const res = await fetch(`/api/quotes/${quoteId}/pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: activeCompany.id }),
            })

            if (!res.ok) {
                const err = await res.json()
                toast.error(err.error || 'Erro ao gerar PDF')
                return
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `orcamento-${quoteNumber}.pdf`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('PDF baixado com sucesso!')
        } catch (err) {
            toast.error('Erro ao gerar PDF')
        } finally {
            setLoadingPdf(null)
        }
    }

    const handleConvertToOrder = async (quoteId: string) => {
        setConverting(quoteId)
        const result = await convertQuoteToOrderAction(quoteId)
        setConverting(null)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Pedido #${result.orderNumber} criado com sucesso! Acesse a aba Pedidos.`)
        }
    }

    if (!activeCompany) {
        return (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                Selecione uma empresa no menu superior para ver os orçamentos.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por cliente..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número / Emissão</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total (R$)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum orçamento encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredQuotes.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium">
                                        {quote.number ? `#${quote.number}` : '-'}
                                        <span className="block text-xs text-muted-foreground">
                                            {quote.issued_at ? format(new Date(quote.issued_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{quote.clients?.nome_razao_social || 'Desconhecido'}</TableCell>
                                    <TableCell>
                                        {quote.total
                                            ? quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <QuoteStatusSelect quoteId={quote.id} currentStatus={quote.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Converter em Pedido — só aparece quando aceito */}
                                            {quote.status === 'accepted' && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={converting === quote.id}
                                                    title="Converter orçamento aprovado em pedido"
                                                    onClick={() => handleConvertToOrder(quote.id)}
                                                >
                                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                                    {converting === quote.id ? 'Convertendo...' : 'Virar Pedido'}
                                                </Button>
                                            )}

                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                disabled={loadingPdf === quote.id}
                                                onClick={() => handleGeneratePdf(quote.id, quote.number)}
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                {loadingPdf === quote.id ? 'Gerando...' : 'PDF'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => window.location.href = `/app/quotes/${quote.id}/edit`}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <DeleteQuoteButton quoteId={quote.id} quoteNumber={quote.number} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
