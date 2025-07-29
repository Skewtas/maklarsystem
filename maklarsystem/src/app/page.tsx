'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Välkommen till Mäklarsystemet
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ett professionellt system för fastighetsmäklare. 
              Hantera objekt, kontakter och affärer på ett effektivt sätt.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                📊 Dashboard
              </h3>
              <p className="text-gray-600 mb-4">
                Få en överblick över alla dina objekt och affärer
              </p>
              <div className="text-blue-600 font-medium">Aktiv</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                🏠 Objekt
              </h3>
              <p className="text-gray-600 mb-4">
                Hantera fastigheter, villor och bostadsrätter
              </p>
              <div className="text-green-600 font-medium">Tillgänglig</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                👥 Kontakter
              </h3>
              <p className="text-gray-600 mb-4">
                Hantera kunder, köpare och säljare
              </p>
              <div className="text-green-600 font-medium">Tillgänglig</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">
              ✅ Systemet körs utan inloggningsrestriktioner
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
