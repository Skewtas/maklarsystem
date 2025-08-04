import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { ObjektDetail } from '@/components/objekt/objekt-detail';
import { ObjektDetailSkeleton } from '@/components/objekt/objekt-detail-skeleton';
import { Objekt, ObjektHistorik } from '@/types/objekt';

interface ObjektPageProps {
  params: {
    id: string;
  };
}

// Mock function - replace with actual database query
async function getObjekt(id: string): Promise<Objekt | null> {
  try {
    // In a real app, this would be a database query
    // const objekt = await db.objekt.findUnique({ where: { id } });
    
    // Mock data for demonstration
    const mockObjekt: Objekt = {
      id,
      titel: "Ljus 3:a med balkong i centrala Vasastan",
      beskrivning: "Välkomna till denna charmiga 3-rumslägenhet belägen på andra våningen i ett välskött hus från 1920-talet. Lägenheten erbjuder en genomtänkt planlösning med generösa rum och god ljusinsläpp från flera väderstreck.\n\nKöket är renoverat med moderna vitvaror och gott om förvaringsplats. Det rymliga vardagsrummet har utgång till en solig balkong med kvällssol. Två sovrum varav det större rymmer dubbelsäng och har inbyggd garderob.\n\nBadrum med dusch, tvättmaskin och torktumlare. Förråd i källaren ingår. Närhet till kommunikationer, shopping och restauranger.",
      adress: "Upplandsgatan 45",
      ort: "Stockholm", 
      omrade: "Vasastan",
      postnummer: "11326",
      pris: 4850000,
      boarea: 78,
      rum: 3,
      sovrum: 2,
      byggår: 1923,
      energiklass: "C",
      månadsavgift: 4200,
      driftkostnad: 800,
      utgångspris: 4500000,
      typ: "lägenhet",
      status: "till_salu",
      bilder: [
        {
          id: "1",
          url: "/api/placeholder/800/600?text=Vardagsrum",
          alt: "Ljust vardagsrum med balkongdörr",
          ordning: 1,
          typ: "huvud"
        },
        {
          id: "2", 
          url: "/api/placeholder/800/600?text=Kök",
          alt: "Renoverat kök med moderna vitvaror",
          ordning: 2,
          typ: "interiör"
        },
        {
          id: "3",
          url: "/api/placeholder/800/600?text=Sovrum",
          alt: "Rymligt sovrum med inbyggd garderob", 
          ordning: 3,
          typ: "interiör"
        },
        {
          id: "4",
          url: "/api/placeholder/800/600?text=Badrum",
          alt: "Badrum med dusch och tvättmöjligheter",
          ordning: 4,
          typ: "interiör"
        },
        {
          id: "5",
          url: "/api/placeholder/800/600?text=Balkong",
          alt: "Solig balkong med kvällssol",
          ordning: 5,
          typ: "exteriör"
        },
        {
          id: "6",
          url: "/api/placeholder/800/600?text=Planritning",
          alt: "Planritning över lägenheten",
          ordning: 6,
          typ: "planritning"
        }
      ],
      specifikationer: [
        {
          id: "1",
          kategori: "Allmänt",
          namn: "Upplåtelseform",
          värde: "Bostadsrätt"
        },
        {
          id: "2", 
          kategori: "Allmänt",
          namn: "Våningsplan",
          värde: "2 av 4"
        },
        {
          id: "3",
          kategori: "Allmänt", 
          namn: "Hiss",
          värde: "Nej"
        },
        {
          id: "4",
          kategori: "Värme",
          namn: "Uppvärmning", 
          värde: "Fjärrvärme"
        },
        {
          id: "5",
          kategori: "Kök",
          namn: "Köksutrustning",
          värde: "Renoverat 2020"
        },
        {
          id: "6",
          kategori: "Badrum",
          namn: "Antal badrum",
          värde: "1"
        }
      ],
      dokument: [
        {
          id: "1",
          namn: "Månadsavgift och ekonomi.pdf",
          typ: "pdf",
          storlek: 245760,
          url: "/api/documents/ekonomi.pdf",
          uppladdad: new Date("2024-01-15")
        },
        {
          id: "2",
          namn: "Föreningens årsredovisning.pdf", 
          typ: "pdf",
          storlek: 1048576,
          url: "/api/documents/arsredovisning.pdf",
          uppladdad: new Date("2024-01-10")
        }
      ],
      visningar: [
        {
          id: "1",
          datum: new Date("2024-02-15"),
          startTid: "17:00",
          slutTid: "18:00", 
          typ: "öppet_hus",
          beskrivning: "Öppet hus för alla intresserade",
          tid: "2024-02-15T17:00:00"
        },
        {
          id: "2",
          datum: new Date("2024-02-18"),
          startTid: "12:00", 
          slutTid: "13:00",
          typ: "privat",
          beskrivning: "Privat visning efter bokning",
          tid: "2024-02-18T12:00:00"
        }
      ],
      historik: [
        {
          id: "1",
          objektId: id,
          händelse: "skapad",
          datum: new Date("2024-01-01"),
          beskrivning: "Objektet skapades och publicerades på marknaden",
          värde: "Utgångspris: 4 500 000 kr",
          typ: "Objekt skapat"
        },
        {
          id: "2", 
          objektId: id,
          händelse: "prisändring",
          datum: new Date("2024-01-15"),
          beskrivning: "Priset höjdes baserat på marknadsbedömning",
          värde: "Nytt pris: 4 850 000 kr",
          typ: "Prisändring"
        }
      ],
      mäklare: {
        id: "1",
        namn: "Anna Andersson",
        email: "anna.andersson@maklarsystem.se",
        telefon: "08-123 456 78",
        profilBild: "/api/placeholder/150/150?text=AA",
        titel: "Fastighetsmäklare"
      },
      skapad: new Date("2024-01-01"),
      uppdaterad: new Date("2024-01-20")
    };

    return mockObjekt;
  } catch (error) {
    console.error('Error fetching objekt:', error);
    return null;
  }
}


export async function generateMetadata({ params }: ObjektPageProps): Promise<Metadata> {
  const objekt = await getObjekt(params.id);
  
  if (!objekt) {
    return {
      title: 'Objekt inte hittat | Mäklarsystem',
      description: 'Det begärda objektet kunde inte hittas.'
    };
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return {
    title: `${objekt.titel} | Mäklarsystem`,
    description: `${objekt.typ} på ${objekt.boarea} m² med ${objekt.rum} rum i ${objekt.ort}. Pris: ${formatCurrency(objekt.pris)}. ${objekt.beskrivning.slice(0, 150)}...`,
    keywords: [
      objekt.typ,
      objekt.ort,
      'bostadsrätt',
      'lägenhet',
      'till salu',
      'mäklare',
      'Stockholm'
    ].join(', '),
    openGraph: {
      title: objekt.titel,
      description: objekt.beskrivning.slice(0, 200) + '...',
      images: objekt.bilder.length > 0 ? [
        {
          url: objekt.bilder[0].url,
          width: 800,
          height: 600,
          alt: objekt.bilder[0].alt,
        }
      ] : [],
      type: 'website',
      locale: 'sv_SE',
    },
    twitter: {
      card: 'summary_large_image',
      title: objekt.titel,
      description: objekt.beskrivning.slice(0, 200) + '...',
      images: objekt.bilder.length > 0 ? [objekt.bilder[0].url] : [],
    },
  };
}

export default async function ObjektPage({ params }: ObjektPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Suspense fallback={<ObjektDetailSkeleton />}>
        <ObjektPageContent objektId={params.id} />
      </Suspense>
    </main>
  );
}

async function ObjektPageContent({ objektId }: { objektId: string }) {
  const objekt = await getObjekt(objektId);

  if (!objekt) {
    notFound();
  }

  return (
    <ObjektDetail 
      objekt={objekt}
    />
  );
}