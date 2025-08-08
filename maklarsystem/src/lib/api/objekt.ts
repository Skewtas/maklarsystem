import { Database } from '@/types/database'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { objektCreateSchema, objektUpdateSchema, objektFilterSchema } from '@/lib/validation/schemas/objekt.schema'
import { parseZodError } from '@/lib/validation'
import type { ValidatedObjektCreate, ValidatedObjektUpdate, ObjektRow } from '@/types/objekt.types'
import { z } from 'zod'
import { useSupabase } from '@/utils/supabase/provider'
import type { SupabaseClient } from '@supabase/supabase-js'

type Objekt = Database['public']['Tables']['objekt']['Row']
type ObjektInsert = Database['public']['Tables']['objekt']['Insert']
type ObjektUpdate = Database['public']['Tables']['objekt']['Update']

// Validate and fetch all objects with optional filters
export async function fetchObjekt(supabase: SupabaseClient<Database>, filters?: z.infer<typeof objektFilterSchema>) {
  // Validate filters if provided
  const validatedFilters = filters ? objektFilterSchema.parse(filters) : undefined
  
  let query = supabase
    .from('objekt')
    .select(`
      *,
      maklare:users!maklare_id(id, full_name, email),
      saljare:kontakter!saljare_id(id, fornamn, efternamn),
      kopare:kontakter!kopare_id(id, fornamn, efternamn)
    `)
    .order('created_at', { ascending: false })

  if (validatedFilters?.status && validatedFilters.status !== 'alla') {
    query = query.eq('status', validatedFilters.status)
  }
  if (validatedFilters?.typ && validatedFilters.typ !== 'alla') {
    query = query.eq('typ', validatedFilters.typ)
  }
  if (validatedFilters?.maklare_id) {
    query = query.eq('maklare_id', validatedFilters.maklare_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Fetch single object by ID
export async function fetchObjektById(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('objekt')
    .select(`
      *,
      maklare:users!maklare_id(id, full_name, email),
      saljare:kontakter!saljare_id(id, fornamn, efternamn, email, telefon),
      kopare:kontakter!kopare_id(id, fornamn, efternamn, email, telefon),
      visningar(*),
      bud(*, kontakt:kontakter!kontakt_id(fornamn, efternamn))
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create new object with validation
export async function createObjekt(supabase: SupabaseClient<Database>, objekt: ValidatedObjektCreate) {
  try {
    // Validate input data
    const validatedData = objektCreateSchema.parse(objekt)
    
    const { data, error } = await supabase
      .from('objekt')
      .insert(validatedData as ObjektInsert)
      .select()
      .single()

    if (error) {
      // Handle database constraint violations with Swedish messages
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('objektnummer')) {
          throw new Error('Objektnummer finns redan')
        }
        throw new Error('Objekt med dessa uppgifter finns redan')
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

// Update object with validation
export async function updateObjekt(supabase: SupabaseClient<Database>, id: string, updates: ValidatedObjektUpdate) {
  try {
    // Validate update data
    const validatedData = objektUpdateSchema.parse(updates)
    
    const { data, error } = await supabase
      .from('objekt')
      .update(validatedData as ObjektUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Handle database constraint violations
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('objektnummer')) {
          throw new Error('Objektnummer finns redan')
        }
        throw new Error('Objekt med dessa uppgifter finns redan')
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

// Delete object
export async function deleteObjekt(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase
    .from('objekt')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// React Query hooks
export function useObjekt(filters?: {
  status?: string
  typ?: string
  maklare_id?: string
}) {
  const { supabase } = useSupabase()
  return useQuery({
    queryKey: ['objekt', filters],
    queryFn: () => fetchObjekt(supabase, filters),
  })
}

export function useObjektById(id: string) {
  const { supabase } = useSupabase()
  return useQuery({
    queryKey: ['objekt', id],
    queryFn: () => fetchObjektById(supabase, id),
    enabled: !!id,
  })
}

export function useCreateObjekt() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  return useMutation({
    mutationFn: (objekt: ValidatedObjektCreate) => createObjekt(supabase, objekt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objekt'] })
      toast.success('Objekt skapat')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Kunde inte skapa objekt'
      toast.error(message)
      console.error('Error creating objekt:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        details: error
      })
    },
  })
}

export function useUpdateObjekt() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ValidatedObjektUpdate }) =>
      updateObjekt(supabase, id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['objekt'] })
      queryClient.invalidateQueries({ queryKey: ['objekt', variables.id] })
      toast.success('Objekt uppdaterat')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Kunde inte uppdatera objekt'
      toast.error(message)
      console.error('Error updating objekt:', error)
    },
  })
}

export function useDeleteObjekt() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  return useMutation({
    mutationFn: (id: string) => deleteObjekt(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objekt'] })
      toast.success('Objekt raderat')
    },
    onError: (error) => {
      toast.error('Kunde inte radera objekt')
      console.error('Error deleting objekt:', error)
    },
  })
}

// Real-time subscription hook
export function useObjektSubscription() {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()

  useEffect(() => {
    const channel = supabase
      .channel('objekt-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'objekt' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['objekt'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])
}

// Helper function to validate object data before operations
export function validateObjektData(data: unknown, isUpdate = false): ValidatedObjektCreate | ValidatedObjektUpdate {
  const schema = isUpdate ? objektUpdateSchema : objektCreateSchema
  return schema.parse(data)
}

// Helper function to safely fetch and validate objekt data
export async function fetchAndValidateObjekt(supabase: SupabaseClient<Database>, id: string): Promise<ObjektRow> {
  const objekt = await fetchObjektById(supabase, id)
  if (!objekt) {
    throw new Error('Objekt hittades inte')
  }
  return objekt as ObjektRow
} 