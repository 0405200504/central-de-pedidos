'use client'

import { useState } from 'react'
import { updateQuoteStatusAction } from '../actions'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function QuoteStatusSelect({ quoteId, currentStatus }: { quoteId: string, currentStatus: string }) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(currentStatus)

    async function handleStatusChange(newStatus: string) {
        setStatus(newStatus)
        setLoading(true)
        const result = await updateQuoteStatusAction(quoteId, newStatus)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
            setStatus(currentStatus) // revert on error
        } else {
            toast.success('Status atualizado!')
        }
    }

    // A helper to make the select trigger match the badge colors roughly
    const getStatusColor = (val: string) => {
        switch (val) {
            case 'accepted': return 'text-green-600 dark:text-green-400 font-medium'
            case 'sent': return 'text-blue-600 dark:text-blue-400 font-medium'
            case 'draft': return 'text-gray-600 dark:text-gray-400 font-medium'
            case 'rejected': return 'text-red-600 dark:text-red-400 font-medium'
            case 'expired': return 'text-yellow-600 dark:text-yellow-400 font-medium'
            default: return 'text-gray-600 dark:text-gray-400'
        }
    }

    return (
        <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
            <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusColor(status)}`}>
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="accepted">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
            </SelectContent>
        </Select>
    )
}
