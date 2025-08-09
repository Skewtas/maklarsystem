import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function ObjektLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Temporärt avaktiverat för testning
  // if (!user) {
  //   redirect('/login')
  // }
  
  return <>{children}</>
}