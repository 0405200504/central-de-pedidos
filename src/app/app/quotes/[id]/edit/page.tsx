import { createClient } from '@/lib/supabase/server'
import { QuoteForm } from '../../components/QuoteForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function EditQuotePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Fetch Quote Data
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .eq('id', params.id)
        .single()

    if (quoteError || !quote) {
        redirect('/app/quotes')
    }

    // 2. Find companies for this user to fetch clients/products
    const { data: members } = await supabase
        .from('company_members')
        .select('company_id')

    const companyIds = members?.map((m: any) => m.company_id) || []

    // 3. Getting basic client data and product data
    const [{ data: clients }, { data: products }] = await Promise.all([
        supabase.from('clients').select('id, nome_razao_social, company_id').in('company_id', companyIds).eq('status', 'ativo'),
        supabase.from('products').select('id, name, descricao_curta, preco_base, ncm, company_id').in('company_id', companyIds).eq('status', 'ativo'),
    ])

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
            <div>
                <Link href="/app/quotes" className="text-sm text-muted-foreground flex items-center hover:underline mb-2 w-fit">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Voltar para Orçamentos
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Orçamento {quote.number ? `#${quote.number}` : ''}</h1>
                <p className="text-muted-foreground">
                    Modifique a proposta comercial.
                </p>
            </div>

            <QuoteForm clients={clients || []} products={products || []} initialQuote={quote} />
        </div>
    )
}
