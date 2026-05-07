import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rkexdscaykgylfpaibch.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZXhkc2NheWtneWxmcGFpYmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTYxNzYsImV4cCI6MjA5Mzc3MjE3Nn0.dsIyiBbgWOJnQVvWORrfi6IMxT4KLKsjFl_hLqqtgnM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
