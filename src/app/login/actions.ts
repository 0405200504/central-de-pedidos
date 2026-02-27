'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function checkEnvVars() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        return 'Para criar conta ou entrar, configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel.'
    }
    return null
}

export async function login(formData: FormData) {
    const envError = checkEnvVars()
    if (envError) return { error: envError }

    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            return { error: 'E-mail ou senha incorretos, ou e-mail ainda não confirmado.' }
        }
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/app/dashboard')
}

export async function signup(formData: FormData) {
    const envError = checkEnvVars()
    if (envError) return { error: envError }

    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        if (error.message.includes('User already registered')) {
            return { error: 'Este e-mail já está cadastrado.' }
        }
        return { error: error.message }
    }

    if (authData.user && !authData.session) {
        return { error: 'Conta criada! Confirme seu e-mail (verifique sua caixa de entrada e spam) e depois faça o login.' }
    }

    revalidatePath('/', 'layout')
    redirect('/app/dashboard')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
