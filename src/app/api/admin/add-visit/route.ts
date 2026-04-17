import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

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

    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const facilityId = formData.get('facilityId') as string
    const visitDate = formData.get('visitDate') as string
    const note = formData.get('note') as string | null
    const photo = formData.get('photo') as File | null

    if (!userId || !facilityId || !visitDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let photoPath: string | null = null

    // Upload photo if provided
    if (photo && photo.size > 0) {
      const ext = photo.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('visit-photos')
        .upload(fileName, photo)

      if (uploadError) {
        return NextResponse.json({ error: 'Failed to upload photo: ' + uploadError.message }, { status: 500 })
      }
      photoPath = fileName
    }

    // Create visit record
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .insert({
        user_id: userId,
        facility_id: facilityId,
        photo_url: photoPath || '',
        visit_date: visitDate,
        note: note || null,
      })
      .select()
      .single()

    if (visitError) {
      return NextResponse.json({ error: visitError.message }, { status: 500 })
    }

    // Check if first visit to this facility
    const { data: existingCompletion } = await supabase
      .from('facility_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .single()

    if (!existingCompletion) {
      await supabase
        .from('facility_completions')
        .insert({
          user_id: userId,
          facility_id: facilityId,
          first_visit_id: visit.id,
        })
    }

    return NextResponse.json({ success: true, visit })
  } catch (error) {
    console.error('Error in add-visit API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
