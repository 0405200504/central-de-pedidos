import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuoteDocument } from './QuoteDocument'
import React from 'react'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: userResponse } = await supabase.auth.getUser()
        if (!userResponse.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch quote with joins
        const { data: qData, error: qError } = await supabase
            .from('quotes')
            .select('*, clients(*), companies(*)')
            .eq('id', id)
            .single()

        if (qError || !qData) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
        }

        const { data: iData } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', id)

        // Render PDF to buffer directly
        const buffer = await renderToBuffer(
            React.createElement(QuoteDocument, {
                quote: qData,
                company: qData.companies,
                client: qData.clients,
                items: iData || [],
            })
        )

        // Return PDF as a direct file download
        return new Response(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="orcamento-${qData.number}.pdf"`,
            },
        })

    } catch (err: any) {
        console.error('API Gen PDF Error:', err)
        return NextResponse.json({ error: 'Internal Server Error: ' + err.message }, { status: 500 })
    }
}

