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

    const { visitId } = await request.json()
    if (!visitId) {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 })
    }

    // Get the visit to find its facility and user
    const { data: visit } = await supabase
      .from('visits')
      .select('id, user_id, facility_id, photo_url')
      .eq('id', visitId)
      .single()

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Delete the photo from storage if it exists
    if (visit.photo_url) {
      await supabase.storage.from('visit-photos').remove([visit.photo_url])
    }

    // Check if this visit is referenced as the first_visit in facility_completions
    const { data: completion } = await supabase
      .from('facility_completions')
      .select('id')
      .eq('first_visit_id', visitId)
      .single()

    // Delete the visit
    const { error: deleteError } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // If this was the first visit for the completion, check if other visits exist
    if (completion) {
      const { data: otherVisits } = await supabase
        .from('visits')
        .select('id')
        .eq('user_id', visit.user_id)
        .eq('facility_id', visit.facility_id)
        .order('visit_date', { ascending: true })
        .limit(1)

      if (otherVisits && otherVisits.length > 0) {
        // Update completion to point to the next earliest visit
        await supabase
          .from('facility_completions')
          .update({ first_visit_id: otherVisits[0].id })
          .eq('id', completion.id)
      } else {
        // No more visits to this facility — remove the completion
        await supabase
          .from('facility_completions')
          .delete()
          .eq('id', completion.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete-visit API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
