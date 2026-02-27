'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteClientAction } from '../actions'
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

export function DeleteClientButton({ clientId, clientName }: { clientId: string, clientName: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function handleDelete() {
        setLoading(true)
        const result = await deleteClientAction(clientId)
        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success('Cliente excluído com sucesso!')
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
                    <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir o cliente <strong>{clientName}</strong>? Esta ação não pode ser desfeita e pode afetar pedidos ou orçamentos atrelados a ele.
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
