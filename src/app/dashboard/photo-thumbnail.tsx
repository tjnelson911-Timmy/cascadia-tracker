'use client'

/**
 * Photo Thumbnail Component
 *
 * Shows a small thumbnail of the visit photo.
 * On hover: shows larger preview
 * On click: opens full-size modal
 */

import { useState } from 'react'

interface PhotoThumbnailProps {
  src: string
  alt: string
}

export default function PhotoThumbnail({ src, alt }: PhotoThumbnailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={src}
          alt={alt}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-12 h-12 rounded-lg object-cover cursor-pointer border border-slate-200 hover:border-blue-400 transition-all"
        />

        {/* Hover preview - larger version */}
        {isHovered && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="bg-white p-2 rounded-xl shadow-2xl border border-slate-200">
              <img
                src={src}
                alt={alt}
                className="max-w-[400px] max-h-[400px] w-auto h-auto rounded-lg"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Full-size modal on click */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative bg-white p-2 rounded-xl shadow-2xl max-w-[90vw] max-h-[90vh]">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] w-auto h-auto rounded-lg"
              style={{ objectFit: 'contain' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(false)
              }}
              className="absolute -top-3 -right-3 bg-white hover:bg-slate-100 text-slate-800 rounded-full p-2 shadow-lg transition-colors border border-slate-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
