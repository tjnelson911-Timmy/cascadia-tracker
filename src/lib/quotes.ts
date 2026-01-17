/**
 * Leadership Quotes
 *
 * Collection of inspirational leadership quotes displayed throughout the app.
 *
 * - Primary quotes: The user's custom quotes that appear on the main UI (never change)
 * - Background quotes: A large rotating pool that changes daily on the login page
 */

export interface Quote {
  text: string
  author?: string
  featured?: boolean
}

// Primary quotes - these are the user's custom quotes that stay fixed
export const primaryQuotes: Quote[] = [
  {
    text: "Leadership isn't about being perfect. It's about being present.",
    featured: true,
  },
  {
    text: "Leadership is a dare, and the dare is, are you willing to show up?",
  },
  {
    text: "Leaders show up whether they feel like it or not.",
  },
  {
    text: "Leaders keep going when the going gets tough.",
  },
  {
    text: "Real leadership begins where comfort ends.",
  },
  {
    text: "It's about showing up when it's hardest, listening when it's quietest, and standing tall when others shrink.",
  },
  {
    text: "True leaders don't seek power, they offer strength.",
  },
  {
    text: "Internal leadership is where it starts.",
  },
  {
    text: "Leadership is about making others better as a result of your presence and making sure that impact lasts in your absence.",
  },
  {
    text: "A leader is one who knows the way, goes the way, and shows the way.",
  },
  {
    text: "A leader is best when people barely know he exists. When his work is done, his aim fulfilled, they will say, we did it ourselves.",
    author: "Lao Tzu",
  },
  {
    text: "A leader is someone who demonstrates what's possible.",
  },
  {
    text: "Leadership isn't about having all the answers. It's about being confident, decisive, and having the courage to go forth and do something.",
  },
  {
    text: "The highest form of leadership is one in which a leader raises up other leaders, not as an accident, but as a result of conscious effort.",
  },
  {
    text: "80% of success is showing up.",
  },
]

// Large pool of rotating background quotes - famous leadership quotes
export const backgroundQuotePool: Quote[] = [
  // Classic Leadership Quotes
  { text: "The greatest leader is not necessarily one who does the greatest things, but one who gets people to do the greatest things.", author: "Ronald Reagan" },
  { text: "Before you are a leader, success is all about growing yourself. When you become a leader, success is all about growing others.", author: "Jack Welch" },
  { text: "Leadership is not about being in charge. It's about taking care of those in your charge.", author: "Simon Sinek" },
  { text: "The task of leadership is not to put greatness into people, but to elicit it, for the greatness is there already.", author: "John Buchan" },
  { text: "A leader takes people where they want to go. A great leader takes people where they don't necessarily want to go, but ought to be.", author: "Rosalynn Carter" },
  { text: "Leadership is the capacity to translate vision into reality.", author: "Warren Bennis" },
  { text: "The art of leadership is saying no, not yes. It is very easy to say yes.", author: "Tony Blair" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Management is doing things right; leadership is doing the right things.", author: "Peter Drucker" },
  { text: "The very essence of leadership is that you have to have a vision.", author: "Theodore Hesburgh" },

  // Inspirational Leadership
  { text: "Do not follow where the path may lead. Go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "Example is not the main thing in influencing others. It is the only thing.", author: "Albert Schweitzer" },
  { text: "Leadership is not a position or a title, it is action and example." },
  { text: "People buy into the leader before they buy into the vision.", author: "John Maxwell" },
  { text: "The quality of a leader is reflected in the standards they set for themselves.", author: "Ray Kroc" },
  { text: "You don't lead by pointing and telling people some place to go. You lead by going to that place and making a case.", author: "Ken Kesey" },
  { text: "To handle yourself, use your head; to handle others, use your heart.", author: "Eleanor Roosevelt" },
  { text: "Earn your leadership every day.", author: "Michael Jordan" },
  { text: "He who has never learned to obey cannot be a good commander.", author: "Aristotle" },
  { text: "The supreme quality of leadership is integrity.", author: "Dwight D. Eisenhower" },

  // Courage and Character
  { text: "Courage is what it takes to stand up and speak; courage is also what it takes to sit down and listen.", author: "Winston Churchill" },
  { text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.", author: "Abraham Lincoln" },
  { text: "A genuine leader is not a searcher for consensus but a molder of consensus.", author: "Martin Luther King Jr." },
  { text: "Anyone can hold the helm when the sea is calm.", author: "Publilius Syrus" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "What you do has far greater impact than what you say.", author: "Stephen Covey" },
  { text: "I cannot trust a man to control others who cannot control himself.", author: "Robert E. Lee" },
  { text: "If your actions inspire others to dream more, learn more, do more and become more, you are a leader.", author: "John Quincy Adams" },
  { text: "Great leaders are willing to sacrifice their own personal interests for the good of the team." },
  { text: "Leadership is practiced not so much in words as in attitude and in actions.", author: "Harold S. Geneen" },

  // Service and Humility
  { text: "The servant-leader is servant first.", author: "Robert K. Greenleaf" },
  { text: "A leader is admired, a boss is feared." },
  { text: "True leadership stems from individuality that is honestly and sometimes imperfectly expressed.", author: "Sheryl Sandberg" },
  { text: "Don't tell people how to do things, tell them what to do and let them surprise you with their results.", author: "George Patton" },
  { text: "Leaders don't create followers, they create more leaders.", author: "Tom Peters" },
  { text: "The best executive is one who has sense enough to pick good people to do what he wants done.", author: "Theodore Roosevelt" },
  { text: "It is better to lead from behind and to put others in front.", author: "Nelson Mandela" },
  { text: "The first responsibility of a leader is to define reality. The last is to say thank you.", author: "Max DePree" },
  { text: "No man will make a great leader who wants to do it all himself or get all the credit for doing it.", author: "Andrew Carnegie" },
  { text: "A good leader leads the people from above them. A great leader leads the people from within them.", author: "M.D. Arnold" },

  // Vision and Action
  { text: "Where there is no vision, the people perish.", author: "Proverbs 29:18" },
  { text: "Leadership is lifting a person's vision to high sights.", author: "Peter Drucker" },
  { text: "Keep your fears to yourself, but share your courage with others.", author: "Robert Louis Stevenson" },
  { text: "You manage things; you lead people.", author: "Grace Hopper" },
  { text: "The key to successful leadership is influence, not authority.", author: "Ken Blanchard" },
  { text: "Leaders must be close enough to relate to others, but far enough ahead to motivate them.", author: "John Maxwell" },
  { text: "Effective leadership is not about making speeches or being liked; leadership is defined by results.", author: "Peter Drucker" },
  { text: "A leader's job is not to do the work for others, it's to help others figure out how to do it themselves.", author: "Simon Sinek" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The challenge of leadership is to be strong, but not rude; be kind, but not weak.", author: "Jim Rohn" },

  // Growth and Learning
  { text: "In matters of style, swim with the current; in matters of principle, stand like a rock.", author: "Thomas Jefferson" },
  { text: "The growth and development of people is the highest calling of leadership.", author: "Harvey Firestone" },
  { text: "Leadership and learning are indispensable to each other.", author: "John F. Kennedy" },
  { text: "Become the kind of leader that people would follow voluntarily, even if you had no title or position.", author: "Brian Tracy" },
  { text: "I start with the premise that the function of leadership is to produce more leaders, not more followers.", author: "Ralph Nader" },
  { text: "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires.", author: "William Arthur Ward" },
  { text: "Outstanding leaders go out of their way to boost the self-esteem of their personnel.", author: "Sam Walton" },
  { text: "The pessimist complains about the wind. The optimist expects it to change. The leader adjusts the sails.", author: "John Maxwell" },
  { text: "Leaders aren't born, they are made. And they are made just like anything else, through hard work.", author: "Vince Lombardi" },
  { text: "You don't have to hold a position in order to be a leader.", author: "Henry Ford" },

  // Presence and Impact
  { text: "Your position never gives you the right to command. It only imposes on you the duty of so living your life that others may receive your orders without being humiliated.", author: "Dag Hammarskjold" },
  { text: "Great leaders don't set out to be a leader. They set out to make a difference." },
  { text: "As we look ahead into the next century, leaders will be those who empower others.", author: "Bill Gates" },
  { text: "One of the tests of leadership is the ability to recognize a problem before it becomes an emergency.", author: "Arnold Glasow" },
  { text: "The most powerful leadership tool you have is your own personal example.", author: "John Wooden" },
  { text: "Leadership is about making others better as a result of your presence." },
  { text: "To lead people, walk beside them.", author: "Lao Tzu" },
  { text: "Lead from the heart, not the head." },
  { text: "The mark of a great leader is the ability to develop other leaders." },
  { text: "True leaders don't create more followers. They create more leaders." },
]

// Combine all quotes for backward compatibility
export const leadershipQuotes = primaryQuotes

// Get the featured quote
export function getFeaturedQuote(): Quote | undefined {
  return primaryQuotes.find(q => q.featured)
}

// Get a single random quote from primary quotes
export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * primaryQuotes.length)
  return primaryQuotes[randomIndex]
}

// Get random quotes from primary quotes (for banners, etc.)
export function getRandomQuotes(count: number, excludeFeatured = false): Quote[] {
  const available = excludeFeatured
    ? primaryQuotes.filter(q => !q.featured)
    : primaryQuotes

  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Get daily rotating background quotes
 * Uses the current date as a seed to deterministically select quotes
 * Changes every day at midnight
 */
export function getDailyBackgroundQuotes(count: number): Quote[] {
  // Create a seed based on current date (changes daily)
  const today = new Date()
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

  // Simple seeded random function
  const seededRandom = (seed: number, index: number) => {
    const x = Math.sin(seed + index * 9999) * 10000
    return x - Math.floor(x)
  }

  // Combine primary quotes (excluding featured) with background pool
  const allBackgroundQuotes = [
    ...primaryQuotes.filter(q => !q.featured),
    ...backgroundQuotePool,
  ]

  // Shuffle using the date seed
  const shuffled = allBackgroundQuotes
    .map((quote, i) => ({ quote, sort: seededRandom(dateSeed, i) }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.quote)

  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Short quotes specifically for background display (max 65 chars)
export const shortQuotes: Quote[] = [
  { text: "80% of success is showing up." },
  { text: "Leaders show up whether they feel like it or not." },
  { text: "Real leadership begins where comfort ends." },
  { text: "True leaders don't seek power, they offer strength." },
  { text: "Internal leadership is where it starts." },
  { text: "Leaders keep going when the going gets tough." },
  { text: "Earn your leadership every day.", author: "Michael Jordan" },
  { text: "The servant-leader is servant first.", author: "Robert K. Greenleaf" },
  { text: "A leader is admired, a boss is feared." },
  { text: "You manage things; you lead people.", author: "Grace Hopper" },
  { text: "To lead people, walk beside them.", author: "Lao Tzu" },
  { text: "Lead from the heart, not the head." },
  { text: "Anyone can hold the helm when the sea is calm.", author: "Publilius Syrus" },
  { text: "Where there is no vision, the people perish.", author: "Proverbs 29:18" },
  { text: "Leaders don't create followers, they create more leaders.", author: "Tom Peters" },
  { text: "Leadership and learning are indispensable to each other.", author: "John F. Kennedy" },
  { text: "The supreme quality of leadership is integrity.", author: "Eisenhower" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Leadership is the capacity to translate vision into reality.", author: "Warren Bennis" },
  { text: "A leader is someone who demonstrates what's possible." },
  { text: "Leadership is lifting a person's vision to high sights.", author: "Peter Drucker" },
  { text: "The key to successful leadership is influence, not authority.", author: "Ken Blanchard" },
  { text: "You don't have to hold a position in order to be a leader.", author: "Henry Ford" },
  { text: "Great leaders don't set out to be a leader. They set out to make a difference." },
]

/**
 * Get daily rotating SHORT background quotes for login page
 * Only returns quotes under 65 characters for clean display
 */
export function getDailyShortQuotes(count: number): Quote[] {
  const today = new Date()
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

  const seededRandom = (seed: number, index: number) => {
    const x = Math.sin(seed + index * 9999) * 10000
    return x - Math.floor(x)
  }

  const shuffled = shortQuotes
    .map((quote, i) => ({ quote, sort: seededRandom(dateSeed, i) }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.quote)

  return shuffled.slice(0, Math.min(count, shuffled.length))
}
