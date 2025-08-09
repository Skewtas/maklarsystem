/**
 * Seed Script för Svenska Testdata
 * 
 * Detta script lägger till realistisk svensk testdata för Mäklarsystem
 * Kör med: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ladda environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Använd service role för att bypassa RLS
);

// Svenska testdata för properties
const testProperties = [
  {
    fastighetsbeteckning: 'Vasastan 12:34',
    property_type: 'lagenhet',
    status: 'till_salu',
    street: 'Upplandsgatan 45',
    postal_code: '113 28',
    city: 'Stockholm',
    municipality: 'Stockholms kommun',
    county: 'Stockholms län',
    living_area: 75,
    rooms: 3,
    bathrooms: 1,
    build_year: 1925,
    floors: 2,
    balcony: true,
    asking_price: 6500000,
    monthly_fee: 3500,
    operating_cost: 800,
    title: 'Charmig 3:a i hjärtat av Vasastan',
    short_description: 'Välplanerad lägenhet med originaldetaljer och balkong i populära Vasastan.',
    full_description: `
Välkommen till denna charmiga 3:a om 75 kvm i hjärtat av Vasastan! 

Lägenheten ligger på andra våningen i en välskött fastighet från 1925 och erbjuder en perfekt kombination av sekelskiftescharm och moderna bekvämligheter.

**Bostadens fördelar:**
- Genomgående planlösning med ljusinsläpp från två håll
- Välbevarade originaldetaljer som stuckaturer och spegeldörrar
- Renoverat kök med diskmaskin (2019)
- Balkong i söderläge med eftermiddagssol
- Förråd i källare samt cykelrum

**Området:**
Här bor du med närhet till allt - restauranger, caféer, shopping och utmärkta kommunikationer. Odenplan t-bana ligger bara 5 minuters promenad bort. Vasaparken och Observatorielunden erbjuder grönska och rekreation.

**Föreningen:**
Välskött förening med god ekonomi. Bredband ingår i avgiften.
    `,
    features: [
      'Originaldetaljer bevarade',
      'Genomgående lägenhet',
      'Balkong i söderläge',
      'Förråd i källare',
      'Cykelrum',
      'Tvättstuga i fastigheten',
      'Nära till Odenplan',
      'Bredband ingår'
    ],
    heating_type: 'fjarrvarme',
    energy_class: 'D',
    parking: 'Gatuparkering med boendeparkering',
    lat: 59.3426,
    lng: 18.0548
  },
  {
    fastighetsbeteckning: 'Bromma 5:67',
    property_type: 'villa',
    status: 'till_salu',
    street: 'Alviksvägen 123',
    postal_code: '167 53',
    city: 'Bromma',
    municipality: 'Stockholms kommun',
    county: 'Stockholms län',
    living_area: 165,
    supplementary_area: 25,
    plot_area: 750,
    rooms: 5,
    bathrooms: 2,
    build_year: 1972,
    floors: 2,
    garden: true,
    terrace: true,
    asking_price: 11500000,
    operating_cost: 3000,
    title: 'Familjevänlig villa i lugna Bromma',
    short_description: 'Välplanerad 70-talsvilla med stor tomt och garage i barnvänliga området.',
    full_description: `
Välkommen till denna fina villa om 165 kvm fördelat på två plan plus källare om 25 kvm!

**Bottenvåning:**
Entréhall med gästtoalett, stort vardagsrum med öppen spis, modernt kök i öppen planlösning mot matplats, ett sovrum/kontor samt tvättstuga med groventré.

**Övervåning:**
Fyra sovrum varav ett master bedroom med walk-in-closet, helkaklat badrum med både dusch och badkar, samt balkong.

**Källare:**
Gillestuga med bastu, förråd och teknikrum.

**Tomt & Utvändigt:**
Den härliga tomten om 750 kvm är lättskött med gräsmatta, fruktträd och bärbuskar. Stor altan med kvällssol. Garage för två bilar med förrådsdel.

**Renoveringar:**
- Kök totalrenoverat 2020
- Badrum övervåning renoverat 2019
- Bergvärme installerad 2018
- Tak omlagt 2016

**Området:**
Lugnt och barnvänligt område med gångavstånd till förskola och grundskola. Brommaplan med tunnelbana och all tänkbar service ligger 10 minuter bort med bil.
    `,
    features: [
      'Garage för två bilar',
      'Renoverat kök 2020',
      'Två badrum',
      'Bastu',
      'Bergvärme installerad 2018',
      'Fiber inkopplat',
      'Närhet till skolor',
      'Fruktträd på tomten',
      'Öppen spis',
      'Walk-in-closet'
    ],
    heating_type: 'bergvarme',
    energy_class: 'C',
    parking: 'Garage + uppfart för 2 bilar',
    lat: 59.3389,
    lng: 17.9422
  },
  {
    fastighetsbeteckning: 'Östermalm 45:12',
    property_type: 'lagenhet',
    status: 'till_salu',
    street: 'Karlavägen 78',
    postal_code: '114 59',
    city: 'Stockholm',
    municipality: 'Stockholms kommun',
    county: 'Stockholms län',
    living_area: 142,
    rooms: 4,
    bathrooms: 2,
    build_year: 1910,
    floors: 3,
    balcony: true,
    asking_price: 15900000,
    monthly_fee: 6200,
    title: 'Exklusiv sekelskifteslägenhet på Karlavägen',
    short_description: 'Påkostad våning med högt i tak, arbetskök och två balkonger.',
    full_description: `
Unik möjlighet att förvärva denna exklusiva lägenhet om 142 kvm på attraktiva Karlavägen!

Lägenheten har genomgått en totalrenovering där man bevarat de vackra sekelskiftesdetaljerna samtidigt som man skapat en modern och funktionell bostad.

**Höjdpunkter:**
- Takhöjd om 3,2 meter
- Vackra stuckaturer och rosetter
- Fiskbensparkett i ek
- Arbetskök från Kvänum
- Två helkaklade badrum med golvvärme
- Master bedroom med egen balkong
- Separat gästtoalett

**Planlösning:**
Rymlig hall, stort sällskapsrum med öppen spis, elegant matsal, modernt kök, master bedroom med eget badrum, ytterligare två sovrum, gästbadrum samt gästtoalett.

**Föreningen:**
Anrik förening med utmärkt ekonomi och låg avgift. Hiss finns i fastigheten.
    `,
    features: [
      'Högt i tak 3,2 meter',
      'Originalstuckaturer',
      'Fiskbensparkett',
      'Kvänum-kök',
      'Två balkonger',
      'Öppen spis',
      'Golvvärme i badrum',
      'Hiss',
      'Låg avgift'
    ],
    heating_type: 'fjarrvarme',
    energy_class: 'D',
    parking: 'Möjlighet till garageplats',
    lat: 59.3377,
    lng: 18.0764
  },
  {
    fastighetsbeteckning: 'Nacka 23:89',
    property_type: 'radhus',
    status: 'kommande',
    street: 'Sickla Allé 44',
    postal_code: '131 34',
    city: 'Nacka',
    municipality: 'Nacka kommun',
    county: 'Stockholms län',
    living_area: 125,
    supplementary_area: 15,
    plot_area: 200,
    rooms: 4.5,
    bathrooms: 2,
    build_year: 2018,
    floors: 2,
    terrace: true,
    garden: true,
    asking_price: 7950000,
    monthly_fee: 2800,
    title: 'Modernt radhus i populära Sickla',
    short_description: 'Ljust och fräscht radhus från 2018 med två altaner och liten trädgård.',
    full_description: `
Välkommen till detta moderna radhus byggt 2018 i eftertraktade Sickla!

**Bottenvåning:**
Öppen planlösning mellan kök och vardagsrum, utgång till altan i västerläge, gästtoalett samt entré med god förvaring.

**Övervåning:**
Tre sovrum, allrum/TV-rum, helkaklat badrum med både dusch och badkar, samt balkong från master bedroom.

**Källare:**
Tvättstuga, förråd och teknikrum. Utgång till liten trädgård.

**Standard:**
Genomgående hög standard med ekparkett, vitmålade väggar, spotlights och golvvärme på bottenvåningen.

**Området:**
Sickla är ett av Stockholms mest expansiva områden med ny tunnelbana under byggnation. Sickla köpkvarter med all service ligger inom 5 minuters promenad.
    `,
    features: [
      'Byggt 2018',
      'Två altaner',
      'Golvvärme bottenvåning',
      'Öppen planlösning',
      'Nära framtida tunnelbana',
      'Fiber',
      'Låg avgift',
      'Barnvänligt område'
    ],
    heating_type: 'bergvarme',
    energy_class: 'B',
    parking: 'Egen parkeringsplats',
    lat: 59.3045,
    lng: 18.1040
  },
  {
    fastighetsbeteckning: 'Göteborg 12:45',
    property_type: 'lagenhet',
    status: 'sald',
    street: 'Vasagatan 23',
    postal_code: '411 37',
    city: 'Göteborg',
    municipality: 'Göteborgs kommun',
    county: 'Västra Götalands län',
    living_area: 89,
    rooms: 3.5,
    bathrooms: 1,
    build_year: 1935,
    floors: 4,
    asking_price: 4200000,
    accepted_price: 4450000,
    monthly_fee: 4100,
    title: 'Centralt belägen 3,5:a i Vasastaden',
    short_description: 'Ljus och välplanerad lägenhet med burspråk i centrala Göteborg.',
    full_description: `
SÅLD! 

Denna charmiga lägenhet i Vasastaden gick över utgångspris efter intensiv budgivning.

Lägenheten hade ett attraktivt läge med närhet till Avenyn och centralstation. Det vackra burspråket gav extra ljus och rymd.
    `,
    features: [
      'Burspråk',
      'Originaldetaljer',
      'Centralt läge',
      'Nära Avenyn'
    ],
    heating_type: 'fjarrvarme',
    energy_class: 'E',
    lat: 57.6989,
    lng: 11.9663
  },
  {
    fastighetsbeteckning: 'Sundbyberg 34:22',
    property_type: 'lagenhet',
    status: 'under_kontrakt',
    street: 'Järnvägsgatan 15',
    postal_code: '172 35',
    city: 'Sundbyberg',
    municipality: 'Sundbybergs kommun',
    county: 'Stockholms län',
    living_area: 58,
    rooms: 2,
    bathrooms: 1,
    build_year: 2020,
    floors: 5,
    balcony: true,
    asking_price: 3995000,
    monthly_fee: 2900,
    title: 'Nyproducerad 2:a med balkong',
    short_description: 'Modern tvåa i nyproduktion med balkong och öppen planlösning.',
    full_description: `
UNDER KONTRAKT - Visning inställd

Denna moderna tvåa har hittat sina nya ägare. Tillträde planerat till april.
    `,
    features: [
      'Nyproduktion',
      'Balkong',
      'Öppen planlösning',
      'Diskmaskin',
      'Hiss'
    ],
    heating_type: 'fjarrvarme',
    energy_class: 'A',
    parking: 'Garageplats finns att hyra',
    lat: 59.3617,
    lng: 17.9719
  }
];

// Funktion för att generera slug från titel
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Funktion för att lägga till test-bilder
async function addTestImages(propertyId: string, propertyTitle: string) {
  const testImages = [
    {
      url: `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200`,
      thumbnail_url: `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400`,
      caption: `Exteriör - ${propertyTitle}`,
      is_primary: true,
      is_floorplan: false,
      display_order: 1,
      width: 1200,
      height: 800,
      size_bytes: 250000
    },
    {
      url: `https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200`,
      thumbnail_url: `https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=400`,
      caption: 'Vardagsrum',
      is_primary: false,
      is_floorplan: false,
      display_order: 2,
      width: 1200,
      height: 800,
      size_bytes: 230000
    },
    {
      url: `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200`,
      thumbnail_url: `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400`,
      caption: 'Kök',
      is_primary: false,
      is_floorplan: false,
      display_order: 3,
      width: 1200,
      height: 800,
      size_bytes: 220000
    },
    {
      url: `https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1200`,
      thumbnail_url: `https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400`,
      caption: 'Sovrum',
      is_primary: false,
      is_floorplan: false,
      display_order: 4,
      width: 1200,
      height: 800,
      size_bytes: 210000
    }
  ];

  for (const image of testImages) {
    const { error } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        ...image
      });

    if (error) {
      console.error(`❌ Kunde inte lägga till bild för ${propertyTitle}:`, error.message);
    }
  }
}

// Huvudfunktion för att seeda data
async function seedTestData() {
  console.log('🚀 Startar seeding av svensk testdata...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const property of testProperties) {
    const slug = generateSlug(property.title);
    
    // Sätt published_at för objekt som är till salu eller sålda
    const shouldPublish = ['till_salu', 'sald', 'under_kontrakt'].includes(property.status);
    
    try {
      // Skapa property
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...property,
          slug,
          published_at: shouldPublish ? new Date().toISOString() : null,
          // Sätt en dummy user ID för created_by (du kan ändra detta till en riktig user ID)
          created_by: '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Fel vid skapande av "${property.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Skapade: ${property.title} (${property.city})`);
        successCount++;

        // Lägg till bilder för objektet
        if (data && shouldPublish) {
          await addTestImages(data.id, property.title);
          console.log(`   📸 La till bilder för ${property.title}`);
        }
      }
    } catch (err) {
      console.error(`❌ Oväntat fel:`, err);
      errorCount++;
    }
  }

  // Sammanfattning
  console.log('\n=========================================');
  console.log('📊 Sammanfattning:');
  console.log('=========================================');
  console.log(`✅ Lyckades skapa: ${successCount} objekt`);
  if (errorCount > 0) {
    console.log(`❌ Misslyckades: ${errorCount} objekt`);
  }
  console.log('\n✨ Seeding klar!');
  
  // Tips för användaren
  console.log('\n💡 Tips:');
  console.log('- Besök /objekt för att se alla objekt');
  console.log('- Objekt med status "till_salu" visas publikt');
  console.log('- Testa sök och filter-funktionerna');
  console.log('- Klicka på ett objekt för att se detaljvyn');
}

// Kör seeding
seedTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });