import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ObjektNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <Home className="h-12 w-12 text-gray-400" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Objektet kunde inte hittas
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Det objekt du söker efter finns inte eller har blivit borttaget.
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <p className="mb-2">Möjliga orsaker:</p>
              <ul className="text-left space-y-1 max-w-md mx-auto">
                <li>• Objektet har blivit sålt och arkiverat</li>
                <li>• URL:en är felaktig eller föråldrad</li>
                <li>• Objektet har tillfälligt tagits bort</li>
                <li>• Du saknar behörighet att visa objektet</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="flex items-center">
                <Link href="/objekt">
                  <Search className="h-4 w-4 mr-2" />
                  Sök bland alla objekt
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="flex items-center">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tillbaka till startsidan
                </Link>
              </Button>
            </div>
            
            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500 mb-3">
                Behöver du hjälp? Kontakta vårt kundservice
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <a 
                  href="tel:08-123-456-78" 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  📞 08-123 456 78
                </a>
                <span className="hidden sm:inline text-gray-300">|</span>
                <a 
                  href="mailto:info@maklarsystem.se" 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ✉️ info@maklarsystem.se
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}