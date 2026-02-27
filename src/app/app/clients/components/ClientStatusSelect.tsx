'use client'

import { useState } from 'react'
import { updateClientStatusAction } from '../actions'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function ClientStatusSelect({ clientId, currentStatus }: { clientId: string, currentStatus: string }) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(currentStatus)

    async function handleStatusChange(newStatus: string) {
        setStatus(newStatus)
        setLoading(true)
        const result = await updateClientStatusAction(clientId, newStatus)
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
            case 'ativo': return 'text-green-600 dark:text-green-400 font-medium'
            case 'inativo': return 'text-red-600 dark:text-red-400 font-medium'
            default: return 'text-gray-600 dark:text-gray-400 font-medium'
        }
    }

    return (
        <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
            <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusColor(status)}`}>
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
        </Select>
    )
}
