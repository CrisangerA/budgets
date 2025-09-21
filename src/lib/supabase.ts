import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lhcidtiysldiyshwauvp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY2lkdGl5c2xkaXlzaHdhdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODI4MzIsImV4cCI6MjA3NDA1ODgzMn0.wbR5i5hBbUySOhOMho4hCR7HMSzR7IQ8kYqKbYe_9Ic'

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