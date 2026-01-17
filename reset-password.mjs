import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oilrqcuyqjfxqbbvwopi.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// First get Tim Nelson's user ID
const { data: users, error: listError } = await supabase.auth.admin.listUsers()

if (listError) {
  console.error('Error listing users:', listError)
  process.exit(1)
}

const timNelson = users.users.find(u => u.email === 'tim.nelson@cascadia.local')

if (!timNelson) {
  console.error('Tim Nelson not found')
  process.exit(1)
}

console.log('Found Tim Nelson with ID:', timNelson.id)

// Update the password
const { data, error } = await supabase.auth.admin.updateUserById(
  timNelson.id,
  { password: 'Cascadia2026' }
)

if (error) {
  console.error('Error updating password:', error)
} else {
  console.log('Password updated successfully!')
}
