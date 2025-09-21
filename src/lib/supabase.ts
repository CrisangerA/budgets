import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos de datos para las tablas de la base de datos
export interface Month {
  id: string
  name: string
  total: number
  created_at: string
  updated_at: string
}

export interface Week {
  id: string
  month_id: string
  week_number: number
  amount: number
  provider_id: string | null
  created_at: string
}

export interface Provider {
  id: string
  name: string
  contact_info: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  provider_id: string
  amount: number
  payment_date: string
  description: string | null
  created_at: string
}