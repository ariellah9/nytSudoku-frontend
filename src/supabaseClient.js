import { createClient } from '@supabase/supabase-js'


const supabaseUrl = "https://gvuiclfddkwnvvczgxdy.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dWljbGZkZGt3bnZ2Y3pneGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NDIyNzQsImV4cCI6MjA3MTIxODI3NH0.w0k0FSjNiRXdVDME935fTGRu00Dc48OKGMARlSub2Js"

// This creates the connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey)