import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for data seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Create test user (mäklare)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'anna.andersson@maklarsystem.se',
        full_name: 'Anna Andersson',
        role: 'maklare',
        phone: '070-123 45 67'
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create test contacts
    const { data: contacts, error: contactError } = await supabase
      .from('kontakter')
      .insert([
        {
          typ: 'privatperson',
          fornamn: 'Erik',
          efternamn: 'Eriksson',
          email: 'erik@example.com',
          telefon: '070-234 56 78',
          kategori: 'saljare',
          adress: 'Testgatan 1',
          postnummer: '12345',
          ort: 'Stockholm'
        },
        {
          typ: 'privatperson',
          fornamn: 'Maria',
          efternamn: 'Nilsson',
          email: 'maria@example.com',
          telefon: '070-345 67 89',
          kategori: 'kopare',
          adress: 'Köpargatan 2',
          postnummer: '54321',
          ort: 'Göteborg'
        }
      ])
      .select()

    if (contactError) {
      console.error('Contact creation error:', contactError)
      return NextResponse.json({ error: 'Failed to create contacts' }, { status: 500 })
    }

    // Create test objects
    const { data: objekt, error: objektError } = await supabase
      .from('objekt')
      .insert([
        {
          typ: 'villa',
          status: 'till_salu',
          adress: 'Storgatan 12',
          postnummer: '11234',
          ort: 'Stockholm',
          kommun: 'Stockholm',
          lan: 'Stockholm',
          utgangspris: 4500000,
          boarea: 120,
          biarea: 30,
          tomtarea: 800,
          rum: 5,
          byggaar: 1985,
          maklare_id: user.id,
          saljare_id: contacts[0].id,
          beskrivning: 'Vacker villa i lugnt område med stor trädgård och garage.'
        },
        {
          typ: 'lagenhet',
          status: 'uppdrag',
          adress: 'Parkvägen 5',
          postnummer: '41234',
          ort: 'Göteborg',
          kommun: 'Göteborg',
          lan: 'Västra Götaland',
          utgangspris: 3200000,
          boarea: 85,
          biarea: 10,
          rum: 3,
          byggaar: 2010,
          maklare_id: user.id,
          beskrivning: 'Modern lägenhet med balkong och öppen planlösning.'
        },
        {
          typ: 'radhus',
          status: 'sald',
          adress: 'Sjövägen 8',
          postnummer: '21234',
          ort: 'Malmö',
          kommun: 'Malmö',
          lan: 'Skåne',
          utgangspris: 5800000,
          slutpris: 6100000,
          boarea: 140,
          biarea: 25,
          tomtarea: 200,
          rum: 6,
          byggaar: 2005,
          maklare_id: user.id,
          kopare_id: contacts[1].id,
          beskrivning: 'Välskött radhus med närhet till hav och kommunikationer.'
        }
      ])
      .select()

    if (objektError) {
      console.error('Object creation error:', objektError)
      return NextResponse.json({ error: 'Failed to create objects' }, { status: 500 })
    }

    // Create test viewings
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: visningar, error: visningError } = await supabase
      .from('visningar')
      .insert([
        {
          objekt_id: objekt[0].id,
          datum: tomorrow.toISOString().split('T')[0],
          starttid: '14:00',
          sluttid: '15:00',
          typ: 'oppen',
          antal_besokare: 12
        }
      ])
      .select()

    if (visningError) {
      console.error('Viewing creation error:', visningError)
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        user,
        contacts: contacts.length,
        objekt: objekt.length,
        visningar: visningar?.length || 0
      }
    })

  } catch (error) {
    console.error('Seed data error:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
} 