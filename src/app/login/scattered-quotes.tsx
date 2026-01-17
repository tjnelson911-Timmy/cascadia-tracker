'use client'

/**
 * Scattered Quotes Component
 *
 * Creative, fun display of leadership quotes scattered around the login page.
 * Features varied angles, sizes, fonts, and positions for visual interest.
 * STAGGERED LAYOUT ensures quotes never overlap.
 * Quotes rotate daily.
 */

import { useMemo } from 'react'
import { getDailyBackgroundQuotes } from '@/lib/quotes'

/*
 * STAGGERED ZONE LAYOUT - Quotes at different vertical AND horizontal positions
 * No two quotes share the same vertical or horizontal band
 *
 * Visual map:
 *
 *  [1]
 *           [2]                              [3]
 *                                                    [4]
 *  [5]
 *                                                    [6]
 *  [7]
 *                                                    [8]
 *           [9]
 *                                                    [10]
 *  [11]
 *                              [12]
 *                                                    [13]
 */

const quotePositions = [
  // === SCATTERED TOP AREA ===
  // Zone 1: Top left corner - ONLY quote in top-left quadrant
  {
    top: '2%',
    left: '2%',
    rotate: -5,
    size: 'text-sm sm:text-base',
    weight: 'font-bold',
    opacity: 'opacity-30',
    maxW: 130,
    font: 'font-serif',
  },
  // Zone 2: Top CENTER - small, well-centered
  {
    top: '3%',
    left: '38%',
    rotate: 3,
    size: 'text-xs sm:text-sm',
    weight: 'font-medium',
    opacity: 'opacity-35',
    maxW: 90,
    font: 'font-sans',
  },
  // Zone 3: Top right corner - ONLY quote in top-right quadrant
  {
    top: '2%',
    right: '2%',
    rotate: 6,
    size: 'text-sm sm:text-base',
    weight: 'font-semibold',
    opacity: 'opacity-30',
    maxW: 130,
    font: 'font-serif',
  },

  // === LEFT SIDE (staggered) ===
  // Zone 5: Left upper
  {
    top: '22%',
    left: '2%',
    rotate: 5,
    size: 'text-sm sm:text-base',
    weight: 'font-semibold',
    opacity: 'opacity-35',
    maxW: 155,
    font: 'font-sans',
  },
  // Zone 7: Left middle
  {
    top: '42%',
    left: '3%',
    rotate: -6,
    size: 'text-base sm:text-lg',
    weight: 'font-bold',
    opacity: 'opacity-25',
    maxW: 160,
    font: 'font-serif',
  },
  // Zone 11: Left lower
  {
    top: '62%',
    left: '2%',
    rotate: 4,
    size: 'text-sm sm:text-base',
    weight: 'font-light',
    opacity: 'opacity-35',
    maxW: 150,
    font: 'font-sans',
  },

  // === RIGHT SIDE (staggered, offset from left) ===
  // Zone 6: Right upper
  {
    top: '32%',
    right: '2%',
    rotate: -5,
    size: 'text-base sm:text-lg',
    weight: 'font-medium',
    opacity: 'opacity-30',
    maxW: 165,
    font: 'font-serif',
  },
  // Zone 8: Right middle
  {
    top: '52%',
    right: '3%',
    rotate: 7,
    size: 'text-xs sm:text-sm',
    weight: 'font-bold',
    opacity: 'opacity-40',
    maxW: 145,
    font: 'font-sans',
  },
  // Zone 10: Right lower - MOVED UP to avoid bottom quotes
  {
    top: '68%',
    right: '2%',
    rotate: -4,
    size: 'text-sm sm:text-base',
    weight: 'font-semibold',
    opacity: 'opacity-30',
    maxW: 140,
    font: 'font-serif',
  },

  // === SCATTERED BOTTOM AREA ===
  // Zone 9: Lower left area
  {
    bottom: '12%',
    left: '18%',
    rotate: 6,
    size: 'text-sm sm:text-base',
    weight: 'font-normal',
    opacity: 'opacity-35',
    maxW: 140,
    font: 'font-sans',
  },
  // Zone 12: Bottom center-ish
  {
    bottom: '2%',
    left: '40%',
    rotate: -3,
    size: 'text-sm sm:text-base',
    weight: 'font-bold',
    opacity: 'opacity-25',
    maxW: 140,
    font: 'font-serif',
  },
  // Zone 13: Bottom right - MOVED LEFT to avoid Zone 10
  {
    bottom: '2%',
    right: '2%',
    rotate: 5,
    size: 'text-xs sm:text-sm',
    weight: 'font-medium',
    opacity: 'opacity-40',
    maxW: 130,
    font: 'font-sans',
  },
]

export default function ScatteredQuotes() {
  const quotes = useMemo(() => {
    return getDailyBackgroundQuotes(quotePositions.length)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {quotes.map((quote, index) => {
        const pos = quotePositions[index]
        if (!pos) return null

        // Alternate between italic and normal for variety
        const isItalic = index % 3 !== 0

        return (
          <div
            key={index}
            className={`absolute text-white leading-snug ${pos.size} ${pos.weight} ${pos.opacity} ${pos.font} ${isItalic ? 'italic' : ''}`}
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              right: pos.right,
              maxWidth: pos.maxW,
              transform: `rotate(${pos.rotate}deg)`,
              textAlign: pos.right ? 'right' : 'left',
            }}
          >
            <span className="drop-shadow-sm">&ldquo;{quote.text}&rdquo;</span>
            {quote.author && (
              <span className={`block text-[10px] sm:text-xs mt-1 opacity-70 ${isItalic ? 'not-italic' : 'italic'}`}>
                — {quote.author}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
