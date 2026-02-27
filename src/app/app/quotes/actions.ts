'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function createQuoteAction(
    companyId: string,
    clientId: string,
    items: any[],
    data: any
) {
    const supabase = await createClient()
    const { data: userResponse } = await supabase.auth.getUser()

    if (!userResponse.user) {
        return { error: 'Não autenticado.' }
    }

    // Calculate totals
    let subtotal = 0
    let discount_total = parseFloat(data.discount_total || '0')
    let tax_total = parseFloat(data.tax_total || '0')
    let shipping_total = parseFloat(data.shipping_total || '0')

    for (const item of items) {
        subtotal += (item.qty * item.unit_price) - (item.discounts || 0)
        tax_total += (item.taxes || 0)
    }

    const total = subtotal - discount_total + tax_total + shipping_total

    // 1. Insert Quote
    const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert([
            {
                company_id: companyId,
                client_id: clientId,
                status: data.status || 'draft',
                valid_until: data.valid_until || null,
                subtotal,
                discount_total,
                tax_total,
                shipping_total,
                total,
                payment_terms: data.payment_terms,
                delivery_time: data.delivery_time,
                freight_type: data.freight_type,
                carrier: data.carrier,
                notes_internal: data.notes_internal,
                notes_external: data.notes_external,
                created_by: userResponse.user.id,
            },
        ])
        .select()
        .single()

    if (quoteError) {
        console.error('Quote creation error:', quoteError)
        return { error: 'Erro ao criar orçamento.' }
    }

    // 2. Insert Items
    const quoteItemsData = items.map(item => ({
        quote_id: quoteData.id,
        product_id: item.product_id || null,
        name: item.name,
        description: item.description,
        ncm: item.ncm,
        qty: item.qty,
        unit: item.unit,
        unit_price: item.unit_price,
        discounts: item.discounts || 0,
        taxes: item.taxes || 0,
        total: (item.qty * item.unit_price) - (item.discounts || 0) + (item.taxes || 0)
    }))

    const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItemsData)

    if (itemsError) {
        console.error('Quote items error:', itemsError)
        return { error: 'Erro ao salvar itens do orçamento.' }
    }

    revalidatePath('/app/quotes')
    return { success: true, quoteId: quoteData.id }
}

export async function deleteQuoteAction(quoteId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('quotes').delete().eq('id', quoteId)

    if (error) {
        return { error: 'Erro ao deletar orçamento.' }
    }
    revalidatePath('/app/quotes')
    return { success: true }
}

export async function updateQuoteStatusAction(quoteId: string, status: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId)

    if (error) {
        return { error: 'Erro ao atualizar status do orçamento.' }
    }
    revalidatePath('/app/quotes')
    return { success: true }
}

export async function generateQuotePdfAction(quoteId: string, companyId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')

        const res = await fetch(`${baseUrl}/api/quotes/${quoteId}/pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString
            },
            body: JSON.stringify({ companyId }),
        })

        if (!res.ok) {
            const errBody = await res.text()
            console.error('API responded with:', res.status, errBody)
            throw new Error(`Falha ao gerar PDF: HTTP ${res.status}`)
        }

        const json = await res.json()
        revalidatePath('/app/quotes')
        return { success: true, pdfUrl: json.pdf_url }
    } catch (error: any) {
        console.error('PDF Generation Error:', error)
        return { error: error.message || 'Erro ao gerar PDF.' }
    }
}

export async function updateQuoteAction(
    quoteId: string,
    companyId: string,
    clientId: string,
    items: any[],
    data: any
) {
    const supabase = await createClient()

    // Calculate totals
    let subtotal = 0
    let discount_total = parseFloat(data.discount_total || '0')
    let tax_total = parseFloat(data.tax_total || '0')
    let shipping_total = parseFloat(data.shipping_total || '0')

    for (const item of items) {
        subtotal += (item.qty * item.unit_price) - (item.discounts || 0)
        tax_total += (item.taxes || 0)
    }

    const total = subtotal - discount_total + tax_total + shipping_total

    // 1. Update Quote
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({
            client_id: clientId,
            status: data.status || 'draft',
            valid_until: data.valid_until || null,
            subtotal,
            discount_total,
            tax_total,
            shipping_total,
            total,
            payment_terms: data.payment_terms,
            delivery_time: data.delivery_time,
            freight_type: data.freight_type,
            carrier: data.carrier,
            notes_internal: data.notes_internal,
            notes_external: data.notes_external,
        })
        .eq('id', quoteId)

    if (quoteError) {
        console.error('Quote update error:', quoteError)
        return { error: 'Erro ao atualizar orçamento.' }
    }

    // 2. Delete old Items
    await supabase.from('quote_items').delete().eq('quote_id', quoteId)

    // 3. Insert new Items
    const quoteItemsData = items.map(item => ({
        quote_id: quoteId,
        product_id: item.product_id || null,
        name: item.name,
        description: item.description,
        ncm: item.ncm,
        qty: item.qty,
        unit: item.unit,
        unit_price: item.unit_price,
        discounts: item.discounts || 0,
        taxes: item.taxes || 0,
        total: (item.qty * item.unit_price) - (item.discounts || 0) + (item.taxes || 0)
    }))

    const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItemsData)

    if (itemsError) {
        console.error('Quote items error:', itemsError)
        return { error: 'Erro ao salvar itens do orçamento.' }
    }

    revalidatePath('/app/quotes')
    return { success: true, quoteId }
}

export async function convertQuoteToOrderAction(quoteId: string) {
    const supabase = await createClient()
    const { data: userResponse } = await supabase.auth.getUser()

    if (!userResponse.user) {
        return { error: 'Não autenticado.' }
    }

    // 1. Fetch the quote with items
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .eq('id', quoteId)
        .single()

    if (quoteError || !quote) {
        return { error: 'Orçamento não encontrado.' }
    }

    // 2. Get or create company counter for order number
    const { data: counter } = await supabase
        .from('company_counters')
        .select('next_order_number')
        .eq('company_id', quote.company_id)
        .single()

    const orderNumber = counter?.next_order_number || 1

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            company_id: quote.company_id,
            client_id: quote.client_id,
            number: orderNumber,
            status: 'rascunho',
            subtotal: quote.subtotal,
            discount_total: quote.discount_total,
            tax_total: quote.tax_total,
            shipping_total: quote.shipping_total,
            total: quote.total,
            payment_terms: quote.payment_terms,
            notes_internal: quote.notes_internal,
            notes_client: quote.notes_external,
            issued_at: new Date().toISOString(),
            created_by: userResponse.user.id,
        }])
        .select()
        .single()

    if (orderError || !order) {
        console.error('Order creation error:', orderError)
        return { error: 'Erro ao criar pedido.' }
    }

    // 4. Create Order Items from Quote Items
    const orderItems = (quote.quote_items || []).map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || null,
        description_snapshot: item.name,
        ncm_snapshot: item.ncm,
        qty: item.qty,
        unit: item.unit,
        unit_price: item.unit_price,
        discount_value: item.discounts || 0,
        tax_value: item.taxes || 0,
        total: item.total,
    }))

    if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('Order items error:', itemsError)
            return { error: 'Erro ao copiar itens para o pedido.' }
        }
    }

    // 5. Update counter
    await supabase
        .from('company_counters')
        .update({ next_order_number: orderNumber + 1 })
        .eq('company_id', quote.company_id)

    revalidatePath('/app/quotes')
    revalidatePath('/app/orders')
    return { success: true, orderId: order.id, orderNumber }
}
