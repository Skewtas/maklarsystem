import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'

type Kontakt = Database['public']['Tables']['kontakter']['Row']
type KontaktInsert = Database['public']['Tables']['kontakter']['Insert']
type KontaktUpdate = Database['public']['Tables']['kontakter']['Update']

// Fetch all contacts with optional filters
export async function fetchKontakter(filters?: {
  kategori?: string
  typ?: string
  search?: string
}) {
  let query = supabase
    .from('kontakter')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.kategori && filters.kategori !== 'alla') {
    query = query.eq('kategori', filters.kategori)
  }
  if (filters?.typ && filters.typ !== 'alla') {
    query = query.eq('typ', filters.typ)
  }
  if (filters?.search && filters.search.trim()) {
    query = query.or(`fornamn.ilike.%${filters.search}%,efternamn.ilike.%${filters.search}%,foretag.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Fetch single contact by ID
export async function fetchKontaktById(id: string) {
  const { data, error } = await supabase
    .from('kontakter')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create new contact
export async function createKontakt(kontakt: KontaktInsert) {
  const { data, error } = await supabase
    .from('kontakter')
    .insert(kontakt)
    .select()
    .single()

  if (error) throw error
  return data
}

// Update contact
export async function updateKontakt(id: string, updates: KontaktUpdate) {
  const { data, error } = await supabase
    .from('kontakter')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete contact
export async function deleteKontakt(id: string) {
  const { error } = await supabase
    .from('kontakter')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// React Query hooks
export function useKontakter(filters?: {
  kategori?: string
  typ?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['kontakter', filters],
    queryFn: () => fetchKontakter(filters),
  })
}

export function useKontaktById(id: string) {
  return useQuery({
    queryKey: ['kontakter', id],
    queryFn: () => fetchKontaktById(id),
    enabled: !!id,
  })
}

export function useCreateKontakt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createKontakt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kontakter'] })
      toast.success('Kontakt skapad')
    },
    onError: (error) => {
      toast.error('Kunde inte skapa kontakt')
      console.error('Error creating kontakt:', error)
    },
  })
}

export function useUpdateKontakt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: KontaktUpdate }) =>
      updateKontakt(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kontakter'] })
      queryClient.invalidateQueries({ queryKey: ['kontakter', variables.id] })
      toast.success('Kontakt uppdaterad')
    },
    onError: (error) => {
      toast.error('Kunde inte uppdatera kontakt')
      console.error('Error updating kontakt:', error)
    },
  })
}

export function useDeleteKontakt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteKontakt,
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
  }, [queryClient])
} 