/**
 * Create User API Route
 *
 * Creates a new user account. Only accessible to admin users.
 */

import { createClient } from '@/lib/supabase/server'
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

    // Create user using signUp (works with anon key)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      console.error('Error creating user:', signUpError)
      return NextResponse.json({ error: signUpError.message }, { status: 500 })
    }

    if (!signUpData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // The trigger should auto-create the profile, but let's make sure must_change_password is true
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500))

    // Update profile to ensure must_change_password is true
    await supabase
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', signUpData.user.id)

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
