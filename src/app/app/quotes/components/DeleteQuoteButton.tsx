'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteQuoteAction } from '../actions'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteQuoteButton({ quoteId, quoteNumber }: { quoteId: string, quoteNumber: string | number | null }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function handleDelete() {
        setLoading(true)
        const result = await deleteQuoteAction(quoteId)
        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success('Orçamento excluído com sucesso!')
            setOpen(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir o orçamento <strong>{quoteNumber ? `#${quoteNumber}` : 'sem número'}</strong>? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? 'Excluindo...' : 'Sim, Excluir'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
