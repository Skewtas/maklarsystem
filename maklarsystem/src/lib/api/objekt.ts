import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'

type Objekt = Database['public']['Tables']['objekt']['Row']
type ObjektInsert = Database['public']['Tables']['objekt']['Insert']
type ObjektUpdate = Database['public']['Tables']['objekt']['Update']

// Fetch all objects with optional filters
export async function fetchObjekt(filters?: {
  status?: string
  typ?: string
  maklare_id?: string
}) {
  let query = supabase
    .from('objekt')
    .select(`
      *,
      maklare:users!maklare_id(id, full_name, email),
      saljare:kontakter!saljare_id(id, fornamn, efternamn),
      kopare:kontakter!kopare_id(id, fornamn, efternamn)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'alla') {
    query = query.eq('status', filters.status)
  }
  if (filters?.typ && filters.typ !== 'alla') {
    query = query.eq('typ', filters.typ)
  }
  if (filters?.maklare_id) {
    query = query.eq('maklare_id', filters.maklare_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Fetch single object by ID
export async function fetchObjektById(id: string) {
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

// Create new object
export async function createObjekt(objekt: ObjektInsert) {
  const { data, error } = await supabase
    .from('objekt')
    .insert(objekt)
    .select()
    .single()

  if (error) throw error
  return data
}

// Update object
export async function updateObjekt(id: string, updates: ObjektUpdate) {
  const { data, error } = await supabase
    .from('objekt')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete object
export async function deleteObjekt(id: string) {
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
  return useQuery({
    queryKey: ['objekt', filters],
    queryFn: () => fetchObjekt(filters),
  })
}

export function useObjektById(id: string) {
  return useQuery({
    queryKey: ['objekt', id],
    queryFn: () => fetchObjektById(id),
    enabled: !!id,
  })
}

export function useCreateObjekt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createObjekt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objekt'] })
      toast.success('Objekt skapat')
    },
    onError: (error) => {
      toast.error('Kunde inte skapa objekt')
      console.error('Error creating objekt:', error)
    },
  })
}

export function useUpdateObjekt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ObjektUpdate }) =>
      updateObjekt(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['objekt'] })
      queryClient.invalidateQueries({ queryKey: ['objekt', variables.id] })
      toast.success('Objekt uppdaterat')
    },
    onError: (error) => {
      toast.error('Kunde inte uppdatera objekt')
      console.error('Error updating objekt:', error)
    },
  })
}

export function useDeleteObjekt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteObjekt,
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
  }, [queryClient])
} 