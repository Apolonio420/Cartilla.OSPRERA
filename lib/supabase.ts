// Mejorar la configuración de Supabase con un patrón singleton para evitar múltiples conexiones

import { createClient } from "@supabase/supabase-js"

// Verificar las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "⚠️ Faltan variables de entorno de Supabase. Asegúrate de configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

// Cliente para uso en el servidor
export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente para uso en el cliente (navegador)
let browserSupabase: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowser() {
  if (!browserSupabase) {
    browserSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return browserSupabase
}

// Función para obtener el cliente adecuado según el contexto
export function getSupabase() {
  if (typeof window === "undefined") {
    return supabase // Estamos en el servidor
  } else {
    return getSupabaseBrowser() // Estamos en el cliente
  }
}
