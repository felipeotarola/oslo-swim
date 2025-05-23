import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"

// Browser Supabase client that saves the session in cookies so that
// server-side middleware can read the auth state.
export const supabaseBrowser = createBrowserSupabaseClient()
