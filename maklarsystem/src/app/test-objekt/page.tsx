'use client'

import { useState } from 'react'
import { useSupabase } from '@/lib/supabase-provider'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function TestObjektPage() {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user) {
      toast.error('Du måste vara inloggad')
      return
    }

    try {
      // Minimal data för test
      const testData = {
        typ: 'villa',
        adress: 'Testgatan 123',
        postnummer: '12345',
        ort: 'Stockholm',
        kommun: 'Stockholm',
        lan: 'Stockholm', // Added required field
        status: 'kundbearbetning',
        maklare_id: user.id
      }

      console.log('Attempting to insert:', testData)

      const { data, error } = await supabase
        .from('objekt')
        .insert(testData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        toast.error(`Fel: ${error.message}`)
      } else {
        console.log('Success:', data)
        toast.success('Objekt skapat!')
        router.push('/objekt')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Ett oväntat fel uppstod')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Objekt Skapande</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
        <p className="text-sm">Detta är en test-sida för att verifiera att objekt kan skapas i databasen.</p>
        <p className="text-sm">Inloggad som: {user?.email || 'Ej inloggad'}</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-sm">
        <button
          type="submit"
          disabled={isSubmitting || !user}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Skapar...' : 'Skapa Test Objekt'}
        </button>
      </form>

      <div className="mt-8 text-sm text-gray-600">
        <h2 className="font-bold mb-2">Data som skickas:</h2>
        <pre className="bg-gray-100 p-2 rounded">
{`{
  typ: 'villa',
  adress: 'Testgatan 123',
  postnummer: '12345',
  ort: 'Stockholm', 
  kommun: 'Stockholm',
  lan: 'Stockholm',
  status: 'kundbearbetning',
  maklare_id: '${user?.id || '???'}'
}`}
        </pre>
      </div>
    </div>
  )
}