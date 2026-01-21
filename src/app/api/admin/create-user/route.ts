/**
 * Create User API Route
 *
 * Creates a new user account. Only accessible to admin users.
 * Uses admin client to auto-confirm email.
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Get user data from request
    const { fullName, password } = await request.json()

    if (!fullName || !password) {
      return NextResponse.json({ error: 'Full name and password are required' }, { status: 400 })
    }

    // Generate email from full name: "John Smith" -> "john.smith@cascadia.local"
    const email = fullName.toLowerCase().replace(/\s+/g, '.') + '@cascadia.local'

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', fullName)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'A user with this name already exists' }, { status: 400 })
    }

    // Create user using admin client (auto-confirms email)
    const adminClient = createAdminClient()
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    if (!createData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Update profile to ensure must_change_password is true
    await supabase
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', createData.user.id)

    return NextResponse.json({
      success: true,
      message: `User "${fullName}" created successfully`,
      email
    })

  } catch (error) {
    console.error('Error in create-user API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
