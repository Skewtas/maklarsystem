'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DemoTabsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-light text-gray-800 mb-6">Demo: 13-Tab Objekt View</h1>
        
        <Tabs defaultValue="oversikt" className="w-full">
          <div className="backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl p-2 mb-6">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 xl:grid-cols-13 gap-1 bg-transparent">
              <TabsTrigger value="oversikt" className="data-[state=active]:bg-white/40">Översikt</TabsTrigger>
              <TabsTrigger value="beskrivningar" className="data-[state=active]:bg-white/40">Beskrivningar</TabsTrigger>
              <TabsTrigger value="spekulanter" className="data-[state=active]:bg-white/40">Spekulanter</TabsTrigger>
              <TabsTrigger value="dokument" className="data-[state=active]:bg-white/40">Dokument</TabsTrigger>
              <TabsTrigger value="parter" className="data-[state=active]:bg-white/40">Parter</TabsTrigger>
              <TabsTrigger value="affaren" className="data-[state=active]:bg-white/40">Affären</TabsTrigger>
              <TabsTrigger value="bilder" className="data-[state=active]:bg-white/40">Bilder</TabsTrigger>
              <TabsTrigger value="visningar" className="data-[state=active]:bg-white/40">Visningar</TabsTrigger>
              <TabsTrigger value="foreningen" className="data-[state=active]:bg-white/40">Föreningen</TabsTrigger>
              <TabsTrigger value="marknadsforing" className="data-[state=active]:bg-white/40">Marknadsföring</TabsTrigger>
              <TabsTrigger value="tjanster" className="data-[state=active]:bg-white/40">Tjänster</TabsTrigger>
              <TabsTrigger value="lan-och-pant" className="data-[state=active]:bg-white/40">Lån och Pant</TabsTrigger>
              <TabsTrigger value="att-gora" className="data-[state=active]:bg-white/40">Att göra</TabsTrigger>
            </TabsList>
          </div>

          <div className="backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl p-6">
            <TabsContent value="oversikt">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Översikt</h2>
              <p>Innehåll för översiktsfliken</p>
            </TabsContent>

            <TabsContent value="beskrivningar">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Beskrivningar</h2>
              <p>Innehåll för beskrivningsfliken</p>
            </TabsContent>

            <TabsContent value="spekulanter">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Spekulanter</h2>
              <p>Innehåll för spekulantfliken</p>
            </TabsContent>

            <TabsContent value="dokument">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dokument</h2>
              <p>Innehåll för dokumentfliken</p>
            </TabsContent>

            <TabsContent value="parter">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Parter</h2>
              <p>Innehåll för parterfliken</p>
            </TabsContent>

            <TabsContent value="affaren">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Affären</h2>
              <p>Innehåll för affärsfliken</p>
            </TabsContent>

            <TabsContent value="bilder">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bilder</h2>
              <p>Innehåll för bildfliken</p>
            </TabsContent>

            <TabsContent value="visningar">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Visningar</h2>
              <p>Innehåll för visningsfliken</p>
            </TabsContent>

            <TabsContent value="foreningen">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Föreningen</h2>
              <p>Innehåll för föreningsfliken</p>
            </TabsContent>

            <TabsContent value="marknadsforing">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Marknadsföring</h2>
              <p>Innehåll för marknadsföringsfliken</p>
            </TabsContent>

            <TabsContent value="tjanster">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tjänster</h2>
              <p>Innehåll för tjänstefliken</p>
            </TabsContent>

            <TabsContent value="lan-och-pant">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Lån och Pant</h2>
              <p>Innehåll för lån och pantfliken</p>
            </TabsContent>

            <TabsContent value="att-gora">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Att göra</h2>
              <p>Innehåll för att göra-fliken</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}