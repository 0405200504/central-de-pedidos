'use client'

import { useState } from 'react'
import { updateOrderStatusAction } from '../actions'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(currentStatus || 'rascunho')

    async function handleStatusChange(newStatus: string) {
        setStatus(newStatus)
        setLoading(true)
        const result = await updateOrderStatusAction(orderId, newStatus)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
            setStatus(currentStatus) // revert on error
        } else {
            toast.success('Status atualizado!')
        }
    }

    const getStatusColor = (val: string) => {
        switch (val) {
            case 'aprovado': return 'text-green-600 dark:text-green-400 font-medium'
            case 'faturado': return 'text-blue-600 dark:text-blue-400 font-medium'
            case 'enviado': return 'text-yellow-600 dark:text-yellow-400 font-medium'
            case 'cancelado': return 'text-red-600 dark:text-red-400 font-medium'
            case 'rascunho':
            default: return 'text-gray-600 dark:text-gray-400 font-medium'
        }
    }

    return (
        <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
            <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusColor(status)}`}>
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="faturado">Faturado</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
        </Select>
    )
}
