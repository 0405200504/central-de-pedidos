'use client'

import { useAppContext } from '@/components/providers/AppProvider'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CompanyPortalPage() {
    const { companies } = useAppContext()
    const params = useParams()
    const router = useRouter()

    const company = companies.find((c) => c.id === params.id)

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10" />
                <p>Empresa não encontrada.</p>
                <Button variant="outline" onClick={() => router.push('/app/companies')}>
                    Voltar para Empresas
                </Button>
            </div>
        )
    }

    if (!company.system_url) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
                <h2 className="text-xl font-semibold text-foreground">Nenhum sistema configurado</h2>
                <p className="text-sm max-w-sm text-center">
                    A empresa <strong>{company.name}</strong> ainda não tem uma URL de sistema cadastrada.
                    Edite a empresa e adicione a URL do sistema externo.
                </p>
                <Button variant="outline" onClick={() => router.push('/app/companies')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Editar empresa
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full -m-8">
            {/* Topbar do portal */}
            <div className="flex items-center gap-3 px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-900 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-semibold">{company.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-xs">{company.system_url}</span>
                </div>
                <a
                    href={company.system_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir em nova aba
                </a>
            </div>

            {/* Iframe */}
            <iframe
                src={company.system_url}
                className="flex-1 w-full border-0"
                title={`Sistema de ${company.name}`}
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
        </div>
    )
}
