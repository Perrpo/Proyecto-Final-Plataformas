import env from '#start/env'

export const supabaseConfig = {
  url: env.get('SUPABASE_URL'),
  key: env.get('SUPABASE_KEY'),
}
