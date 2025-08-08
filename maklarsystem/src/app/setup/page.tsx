'use client'

import { useState } from 'react'
import { useSupabase } from '@/utils/supabase/provider'
import { toast } from 'sonner'

export default function SetupPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<any>(null)

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-supabase')
      const data = await response.json()
      setConnectionStatus(data)
      
      if (data.connection.success) {
        toast.success('Supabase connection successful!')
      } else {
        toast.error('Database tables not found. Please run the schema in Supabase dashboard.')
      }
    } catch (error) {
      toast.error('Failed to test connection')
      console.error(error)
    }
    setIsLoading(false)
  }

  const addSampleData = async () => {
    setIsLoading(true)
    try {
      // First create a user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: 'demo@maklarsystem.se',
            full_name: 'Demo Mäklare',
            role: 'admin',
            phone: '070-123 45 67'
          }
        ])
        .select()
        .single()

      if (userError) {
        throw userError
      }

      // Add sample contacts
      const { data: contacts, error: contactError } = await supabase
        .from('kontakter')
        .insert([
          {
            typ: 'privatperson',
            fornamn: 'Anna',
            efternamn: 'Andersson',
            email: 'anna.andersson@email.se',
            telefon: '070-111 22 33',
            adress: 'Storgatan 1',
            postnummer: '12345',
            ort: 'Stockholm',
            kategori: 'saljare'
          },
          {
            typ: 'privatperson',
            fornamn: 'Erik',
            efternamn: 'Eriksson',
            email: 'erik.eriksson@email.se',
            telefon: '070-444 55 66',
            adress: 'Lillgatan 2',
            postnummer: '54321',
            ort: 'Göteborg',
            kategori: 'kopare'
          }
        ])
        .select()

      if (contactError) {
        throw contactError
      }

      // Add sample properties
      const { data: properties, error: propertyError } = await supabase
        .from('objekt')
        .insert([
          {
            typ: 'villa',
            status: 'till_salu',
            adress: 'Villagatan 10',
            postnummer: '12345',
            ort: 'Stockholm',
            kommun: 'Stockholm',
            lan: 'Stockholm',
            utgangspris: 4500000,
            boarea: 120,
            rum: 5,
            byggaar: 1995,
            maklare_id: user.id,
            saljare_id: contacts?.[0]?.id,
            beskrivning: 'Vacker villa i lugnt område med stor trädgård'
          },
          {
            typ: 'lagenhet',
            status: 'uppdrag',
            adress: 'Lägenhetsgatan 5',
            postnummer: '54321',
            ort: 'Göteborg',
            kommun: 'Göteborg',
            lan: 'Västra Götaland',
            utgangspris: 2800000,
            boarea: 75,
            rum: 3,
            byggaar: 2010,
            maklare_id: user.id,
            beskrivning: 'Modern lägenhet i centrala läget'
          }
        ])
        .select()

      if (propertyError) {
        throw propertyError
      }

      toast.success('Sample data added successfully!')
      
      // Refresh connection status
      await testConnection()
      
    } catch (error) {
      toast.error('Failed to add sample data: ' + (error as Error).message)
      console.error(error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Mäklarsystem Setup
          </h1>
          <p className="text-gray-600">
            Set up your real estate management system with Supabase
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Database Setup Instructions</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Step 1: Set up Database Schema</h3>
              <p className="text-blue-800 mb-3">
                Go to your Supabase Dashboard → SQL Editor → New Query, then copy and paste the schema from:
              </p>
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                maklarsystem/supabase/schema.sql
              </code>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Step 2: Test Connection</h3>
              <p className="text-green-800 mb-3">
                Once you've run the schema, test the connection:
              </p>
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Step 3: Add Sample Data</h3>
              <p className="text-purple-800 mb-3">
                Add some sample data to test the system:
              </p>
              <button
                onClick={addSampleData}
                disabled={isLoading || !connectionStatus?.connection?.success}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Adding Data...' : 'Add Sample Data'}
              </button>
            </div>
          </div>
        </div>

        {connectionStatus && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Connection Status</h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                connectionStatus.connection.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  Connection: {connectionStatus.connection.success ? '✅ Success' : '❌ Failed'}
                </h3>
                {connectionStatus.connection.error && (
                  <p className="text-red-600 text-sm">{connectionStatus.connection.error}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Database Tables:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {connectionStatus.tables.map((table: any) => (
                    <div
                      key={table.table}
                      className={`p-3 rounded border ${
                        table.exists 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="font-medium">
                        {table.exists ? '✅' : '❌'} {table.table}
                      </div>
                      {table.error && (
                        <div className="text-xs text-red-600 mt-1">{table.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {connectionStatus?.connection?.success && (
          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Go to Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  )
} 