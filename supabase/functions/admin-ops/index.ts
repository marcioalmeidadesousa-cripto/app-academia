import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAIL = 'marcioalmeidadesousa@gmail.com'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Não autorizado')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const admin = createClient(supabaseUrl, serviceKey)
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user } } = await caller.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) throw new Error('Acesso negado')

    const body = await req.json()

    if (body.action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 })
      if (error) throw error
      return new Response(JSON.stringify({ users: data.users }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'create') {
      const { email, password, name } = body
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })
      if (error) throw error
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'delete') {
      const { userId } = body
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Ação inválida')
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
