import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '#config/supabase'

class SupabaseService {
  private supabase

  constructor() {
    this.supabase = createClient(
      supabaseConfig.url,
      supabaseConfig.key
    )
  }

  public getClient() {
    return this.supabase
  }
}

export default new SupabaseService()