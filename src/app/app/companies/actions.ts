'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCompany(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    const name = formData.get('name') as string
    const cnpj = formData.get('cnpj') as string
    const email = formData.get('email') as string
    const system_type = (formData.get('system_type') as string) || 'web'
    const system_url = formData.get('system_url') as string
    const open_in_new_tab = formData.get('open_in_new_tab') === 'true'
    const rdp_host = formData.get('rdp_host') as string
    const rdp_port = parseInt(formData.get('rdp_port') as string) || 3389
    const rdp_user = formData.get('rdp_user') as string

    if (!name) return { error: 'O nome da empresa é obrigatório.' }
    if (system_type === 'rdp' && !rdp_host) return { error: 'Informe o IP ou Host para acesso RDP.' }

    const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
            owner_id: user.id,
            name,
            cnpj,
            email,
            system_type,
            system_url: system_url || null,
            open_in_new_tab,
            rdp_host: rdp_host || null,
            rdp_port: rdp_host ? rdp_port : null,
            rdp_user: rdp_user || null,
        }])
        .select()
        .single()

    if (companyError || !company) {
        console.error(companyError)
        return { error: 'Erro ao criar a empresa.' }
    }

    // Add current user to company_members
    await supabase.from('company_members').insert([{
        company_id: company.id,
        user_id: user.id,
        role: 'owner',
    }])

    revalidatePath('/app', 'layout')
    return { success: true }
}

export async function deleteCompany(companyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    const { error } = await supabase
        .from('companies').delete().eq('id', companyId)

    if (error) {
        console.error(error)
        return { error: 'Erro ao excluir a empresa.' }
    }

    revalidatePath('/app', 'layout')
    return { success: true }
}

export async function updateCompany(companyId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    const name = formData.get('name') as string
    const cnpj = formData.get('cnpj') as string
    const email = formData.get('email') as string
    const system_type = (formData.get('system_type') as string) || 'web'
    const system_url = formData.get('system_url') as string
    const open_in_new_tab = formData.get('open_in_new_tab') === 'true'
    const rdp_host = formData.get('rdp_host') as string
    const rdp_port = parseInt(formData.get('rdp_port') as string) || 3389
    const rdp_user = formData.get('rdp_user') as string

    if (!name) return { error: 'O nome da empresa é obrigatório.' }

    const { error } = await supabase
        .from('companies')
        .update({
            name,
            cnpj,
            email,
            system_type,
            system_url: system_url || null,
            open_in_new_tab,
            rdp_host: rdp_host || null,
            rdp_port: rdp_host ? rdp_port : null,
            rdp_user: rdp_user || null,
        })
        .eq('id', companyId)

    if (error) {
        console.error(error)
        return { error: 'Erro ao editar a empresa.' }
    }

    revalidatePath('/app', 'layout')
    return { success: true }
}

export async function updateCompanyStatus(companyId: string, status: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('companies').update({ status }).eq('id', companyId)
    if (error) return { error: 'Erro ao atualizar status.' }
    revalidatePath('/app', 'layout')
    return { success: true }
}
