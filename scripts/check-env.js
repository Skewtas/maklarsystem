// Simple env sanity check (no secrets printed)
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const looksValid = /^https?:\/\/.+/.test(url)

console.log(
  JSON.stringify(
    {
      urlPresent: !!url,
      urlLooksValid: looksValid,
      anonPresent: anon,
    },
    null,
    2
  )
)





