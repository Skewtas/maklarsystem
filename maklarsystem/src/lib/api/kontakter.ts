import { Database } from '@/types/database'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { kontaktCreateSchema, kontaktUpdateSchema, kontaktFilterSchema } from '@/lib/validation/schemas/kontakter.schema'
import { parseZodError } from '@/lib/validation'
import type { ValidatedKontaktCreate, ValidatedKontaktUpdate, KontaktRow } from '@/types/kontakter.types'
import { z } from 'zod'
import { useSupabase } from '@/lib/supabase-provider'
import type { SupabaseClient } from '@supabase/supabase-js'

type Kontakt = Database['public']['Tables']['kontakter']['Row']
type KontaktInsert = Database['public']['Tables']['kontakter']['Insert']
type KontaktUpdate = Database['public']['Tables']['kontakter']['Update']

// Validate and fetch all contacts with optional filters
export async function fetchKontakter(supabase: SupabaseClient<Database>, filters?: z.infer<typeof kontaktFilterSchema>) {
  // Validate filters if provided
  const validatedFilters = filters ? kontaktFilterSchema.parse(filters) : undefined
  
  let query = supabase
    .from('kontakter')
    .select('*')
    .order('created_at', { ascending: false })

  if (validatedFilters?.kategori && validatedFilters.kategori !== 'alla') {
    query = query.eq('kategori', validatedFilters.kategori)
  }
  if (validatedFilters?.typ && validatedFilters.typ !== 'alla') {
    query = query.eq('typ', validatedFilters.typ)
  }
  if (validatedFilters?.search) {
    // Updated to search across more fields including fornamn, efternamn, foretag
    query = query.or(
      `fornamn.ilike.%${validatedFilters.search}%,` +
      `efternamn.ilike.%${validatedFilters.search}%,` +
      `foretag.ilike.%${validatedFilters.search}%,` +
      `email.ilike.%${validatedFilters.search}%,` +
      `telefon.ilike.%${validatedFilters.search}%,` +
      `mobil.ilike.%${validatedFilters.search}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Fetch single contact by ID
export async function fetchKontaktById(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('kontakter')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create new contact with validation
export async function createKontakt(supabase: SupabaseClient<Database>, kontakt: ValidatedKontaktCreate) {
  try {
    // Validate input data
    const validatedData = kontaktCreateSchema.parse(kontakt)
    
    const { data, error } = await supabase
      .from('kontakter')
      .insert(validatedData as KontaktInsert)
      .select()
      .single()

    if (error) {
      // Handle database constraint violations with Swedish messages
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('personnummer')) {
          throw new Error('Personnummer finns redan registrerat')
        }
        if (error.message.includes('organisationsnummer')) {
          throw new Error('Organisationsnummer finns redan registrerat')
        }
        if (error.message.includes('email')) {
          throw new Error('E-postadressen används redan')
        }
        throw new Error('Kontakt med dessa uppgifter finns redan')
      }
      throw error
    }
    
    return data
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = parseZodError(error)
      const message = errors.map(e => e.message).join(', ')
      throw new Error(`Valideringsfel: ${message}`)
    }
    throw error
  }
}

// Update contact with validation
export async function updateKontakt(supabase: SupabaseClient<Database>, id: string, updates: ValidatedKontaktUpdate) {
  try {
    // Validate update data
    const validatedData = kontaktUpdateSchema.parse(updates)
    
    const { data, error } = await supabase
      .from('kontakter')
      .update(validatedData as KontaktUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Handle database constraint violations
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('personnummer')) {
          throw new Error('Personnummer finns redan registrerat')
        }
        if (error.message.includes('organisationsnummer')) {
          throw new Error('Organisationsnummer finns redan registrerat')
        }
        if (error.message.includes('email')) {
          throw new Error('E-postadressen används redan')
        }
        throw new Error('Kontakt med dessa uppgifter finns redan')
      }
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Relaterad data saknas eller är ogiltig')
      }
      throw error
    }
    
    return data
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = parseZodError(error)
      const message = errors.map(e => e.message).join(', ')
      throw new Error(`Valideringsfel: ${message}`)
    }
    throw error
  }
}

// Delete contact
export async function deleteKontakt(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase
    .from('kontakter')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// React Query hooks
export function useKontakter(filters?: z.infer<typeof kontaktFilterSchema>) {
  const { supabase } = useSupabase()
  return useQuery({
    queryKey: ['kontakter', filters],
    queryFn: () => fetchKontakter(supabase, filters),
  })
}

export function useKontaktById(id: string) {
  const { supabase } = useSupabase()
  return useQuery({
    queryKey: ['kontakter', id],
    queryFn: () => fetchKontaktById(supabase, id),
    enabled: !!id,
  })
}

export function useCreateKontakt() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  return useMutation({
    mutationFn: (kontakt: ValidatedKontaktCreate) => createKontakt(supabase, kontakt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kontakter'] })
      toast.success('Kontakt skapad')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Kunde inte skapa kontakt'
      toast.error(message)
      console.error('Error creating kontakt:', error)
    },
  })
}

export function useUpdateKontakt() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ValidatedKontaktUpdate }) =>
      updateKontakt(supabase, id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kontakter'] })
      queryClient.invalidateQueries({ queryKey: ['kontakter', variables.id] })
      toast.success('Kontakt uppdaterad')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Kunde inte uppdatera kontakt'
      toast.error(message)
      console.error('Error updating kontakt:', error)
    },
  })
}

export function useDeleteKontakt() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  return useMutation({
    mutationFn: (id: string) => deleteKontakt(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kontakter'] })
      toast.success('Kontakt raderad')
    },
    onError: (error) => {
      toast.error('Kunde inte radera kontakt')
      console.error('Error deleting kontakt:', error)
    },
  })
}

// Real-time subscription hook
export function useKontakterSubscription() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  useEffect(() => {
    const channel = supabase
      .channel('kontakter-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kontakter' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['kontakter'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])
}

// Helper function to validate contact data before operations
export function validateKontaktData(data: unknown, isUpdate = false): ValidatedKontaktCreate | ValidatedKontaktUpdate {
  const schema = isUpdate ? kontaktUpdateSchema : kontaktCreateSchema
  return schema.parse(data)
}

// Helper function to safely fetch and validate kontakt data
export async function fetchAndValidateKontakt(id: string): Promise<KontaktRow> {
  const kontakt = await fetchKontaktById(id)
  if (!kontakt) {
    throw new Error('Kontakt hittades inte')
  }
  return kontakt as KontaktRow
}

// Helper function to fetch contacts with relations
export async function fetchKontakterWithRelations(filters?: z.infer<typeof kontaktFilterSchema>) {
  const validatedFilters = filters ? kontaktFilterSchema.parse(filters) : undefined
  
  let query = supabase
    .from('kontakter')
    .select(`
      *,
      objekt_som_saljare:objekt!saljare_id(id, objektnummer, adress, status),
      objekt_som_kopare:objekt!kopare_id(id, objektnummer, adress, status),
      bud(id, objekt_id, belopp, status, datum)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (validatedFilters?.kategori && validatedFilters.kategori !== 'alla') {
    query = query.eq('kategori', validatedFilters.kategori)
  }
  if (validatedFilters?.typ && validatedFilters.typ !== 'alla') {
    query = query.eq('typ', validatedFilters.typ)
  }
  if (validatedFilters?.search) {
    query = query.or(
      `fornamn.ilike.%${validatedFilters.search}%,` +
      `efternamn.ilike.%${validatedFilters.search}%,` +
      `foretag.ilike.%${validatedFilters.search}%,` +
      `email.ilike.%${validatedFilters.search}%,` +
      `telefon.ilike.%${validatedFilters.search}%,` +
      `mobil.ilike.%${validatedFilters.search}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data
} 