'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  BedDouble, 
  Ruler, 
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Objekt } from '@/types/objekt';

interface ObjektDetailProps {
  objekt: Objekt;
}

const ObjektDetail: React.FC<ObjektDetailProps> = ({ objekt }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('sv-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'till_salu':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'såld':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'kommande':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === objekt.bilder.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? objekt.bilder.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <Card className="mb-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/30">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {objekt.titel}
                  </h1>
                  <Badge className={getStatusColor(objekt.status)}>
                    {objekt.status}
                  </Badge>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{objekt.adress}, {objekt.omrade}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(objekt.pris)}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BedDouble className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {objekt.rum}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Rum
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Ruler className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {objekt.boarea} m²
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Boarea
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(Math.round(objekt.pris / objekt.boarea))}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Pris/m²
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/30">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-100/50 dark:bg-slate-700/50">
              <TabsTrigger value="overview">Översikt</TabsTrigger>
              <TabsTrigger value="images">Bilder</TabsTrigger>
              <TabsTrigger value="specs">Specifikationer</TabsTrigger>
              <TabsTrigger value="documents">Dokument</TabsTrigger>
              <TabsTrigger value="history">Historik</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                    Beskrivning
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    {objekt.beskrivning}
                  </p>

                  {objekt.visningar && objekt.visningar.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                        Kommande visningar
                      </h3>
                      <div className="space-y-3">
                        {objekt.visningar.map((visning, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg"
                          >
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-slate-700 dark:text-slate-300">
                              {visning.tid || formatDate(visning.datum.toString())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                    Mäklare
                  </h3>
                  <Card className="bg-slate-50/50 dark:bg-slate-700/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                          {objekt.maklare.namn.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          {objekt.maklare.namn}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          {objekt.maklare.titel || 'Fastighetsmäklare'}
                        </p>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            <Phone className="w-4 h-4 mr-2" />
                            {objekt.maklare.telefon}
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            <Mail className="w-4 h-4 mr-2" />
                            {objekt.maklare.email}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="p-6">
              {objekt.bilder && objekt.bilder.length > 0 ? (
                <div>
                  <div className="relative mb-6">
                    <img
                      src={objekt.bilder[currentImageIndex].url}
                      alt={objekt.bilder[currentImageIndex].alt || `Bild ${currentImageIndex + 1}`}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    {objekt.bilder.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {objekt.bilder.length}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {objekt.bilder.map((bild, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={bild.url}
                          alt={bild.alt || `Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  Inga bilder tillgängliga
                </div>
              )}
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specs" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                    Grundläggande information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-600">
                      <span className="text-slate-600 dark:text-slate-400">Rum</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{objekt.rum}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-600">
                      <span className="text-slate-600 dark:text-slate-400">Boarea</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{objekt.boarea} m²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-600">
                      <span className="text-slate-600 dark:text-slate-400">Typ</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{objekt.typ}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-600">
                      <span className="text-slate-600 dark:text-slate-400">Område</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{objekt.omrade}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                    Ekonomi
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-600">
                      <span className="text-slate-600 dark:text-slate-400">Utgångspris</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(objekt.pris)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-600">
                      <span className="text-slate-600 dark:text-slate-400">Pris per m²</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(Math.round(objekt.pris / objekt.boarea))}
                      </span>
                    </div>
                    {objekt.driftkostnad && (
                      <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-600">
                        <span className="text-slate-600 dark:text-slate-400">Driftkostnad/månad</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(objekt.driftkostnad)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="p-6">
              {objekt.dokument && objekt.dokument.length > 0 ? (
                <div className="space-y-4">
                  {objekt.dokument.map((dokument, index) => (
                    <Card key={index} className="bg-slate-50/50 dark:bg-slate-700/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {dokument.namn}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {dokument.typ}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Öppna
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  Inga dokument tillgängliga
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="p-6">
              {objekt.historik && objekt.historik.length > 0 ? (
                <div className="space-y-4">
                  {objekt.historik
                    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
                    .map((event, index) => (
                    <Card key={index} className="bg-slate-50/50 dark:bg-slate-700/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {event.typ}
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {formatDate(event.datum.toString())}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">
                              {event.beskrivning}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  Ingen historik tillgänglig
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export { ObjektDetail };