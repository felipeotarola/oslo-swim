// Use auth helpers to ensure sessions are stored in cookies so that
// server middleware can access them. This fixes issues where protected
// routes would redirect to the login page even though the user was
// logged in.
import { createBrowserClient } from "@supabase/auth-helpers-nextjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
