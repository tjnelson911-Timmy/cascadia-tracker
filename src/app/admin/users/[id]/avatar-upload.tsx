'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
}: {
  userId: string
  currentAvatarUrl: string | null
}) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const url = `${publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', userId)

      if (updateError) throw updateError

      setAvatarUrl(url)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const initials = '?'

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => fileRef.current?.click()}
        className="relative group"
        disabled={uploading}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 group-hover:border-cascadia-400 transition-colors"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cascadia-100 to-cascadia-200 flex items-center justify-center border-2 border-slate-200 group-hover:border-cascadia-400 transition-colors">
            <svg className="w-8 h-8 text-cascadia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cascadia-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
