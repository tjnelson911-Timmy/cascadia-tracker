'use client'

/**
 * Quote Banner Component
 *
 * Displays quotes with varied sizes and fonts in a horizontal banner.
 */

import { useMemo } from 'react'
import { getRandomQuotes, type Quote } from '@/lib/quotes'

// Different style combinations for visual variety
const quoteVariants = [
  { size: 'text-sm', font: 'font-light', opacity: 'text-blue-700/60' },
  { size: 'text-base', font: 'font-medium', opacity: 'text-blue-700/70' },
  { size: 'text-xs', font: 'font-semibold tracking-wide', opacity: 'text-blue-600/60' },
  { size: 'text-sm', font: 'font-normal', opacity: 'text-blue-700/65' },
  { size: 'text-base', font: 'font-light tracking-wider', opacity: 'text-blue-600/70' },
]

interface QuoteBannerProps {
  count?: number
}

export default function QuoteBanner({ count = 3 }: QuoteBannerProps) {
  const quotes = useMemo(() => getRandomQuotes(count, true), [count])

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {quotes.map((quote, index) => {
            const variant = quoteVariants[index % quoteVariants.length]
            return (
              <p
                key={index}
                className={`italic text-center ${variant.size} ${variant.font} ${variant.opacity}`}
              >
                &ldquo;{quote.text}&rdquo;
                {quote.author && (
                  <span className="text-blue-500/50 not-italic font-normal text-xs ml-1">
                    &mdash; {quote.author}
                  </span>
                )}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}
