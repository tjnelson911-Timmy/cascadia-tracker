/**
 * Reset Password API Route
 *
 * Resets a user's password to the default. Only accessible to admin users.
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const DEFAULT_PASSWORD = 'Cascadia1'

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

    // Get target user ID from request
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent admin from resetting their own password through this route
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot reset your own password through this route' }, { status: 400 })
    }

    // Get target user's profile to verify they exist
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Use admin client to reset password
    const adminClient = createAdminClient()

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: DEFAULT_PASSWORD }
    )

    if (updateError) {
      console.error('Error resetting password:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Set must_change_password to true
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      // Password was reset but profile update failed - still consider it a success
    }

    return NextResponse.json({
      success: true,
      message: `Password reset for "${targetProfile.full_name}"`,
    })

  } catch (error) {
    console.error('Error in reset-password API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
