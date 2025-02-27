import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://xvstlacvdhpsyvwudbmo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2c3RsYWN2ZGhwc3l2d3VkYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjExNjgsImV4cCI6MjA1NjE5NzE2OH0.lQirUBw5xCQvjPLZwB9gcjrv_10pUq2WyWbzsBrr7Xc'

export const supabase = createClient(supabaseUrl, supabaseKey)