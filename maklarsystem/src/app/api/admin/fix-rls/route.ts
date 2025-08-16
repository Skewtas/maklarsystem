import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // Execute the RLS fix migration
    const migrationSQL = `
      -- Fix RLS policy for property_images table
      
      -- Drop existing conflicting policies
      DROP POLICY IF EXISTS "Property images are viewable if property is viewable" ON property_images;
      DROP POLICY IF EXISTS "Users can manage images for their properties" ON property_images;
      
      -- Create new policies
      CREATE POLICY IF NOT EXISTS "Anyone can view property images" ON property_images
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM properties 
            WHERE id = property_images.property_id 
              AND (
                status IN ('till_salu', 'under_kontrakt', 'sald')
                OR created_by = auth.uid()
                OR EXISTS (
                  SELECT 1 FROM user_profiles 
                  WHERE user_id = auth.uid() AND role = 'admin'
                )
              )
          )
        );
      
      CREATE POLICY IF NOT EXISTS "Users can insert images for their properties" ON property_images
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM properties 
            WHERE id = property_images.property_id 
              AND created_by = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );
      
      CREATE POLICY IF NOT EXISTS "Users can update images for their properties" ON property_images
        FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM properties 
            WHERE id = property_images.property_id 
              AND created_by = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM properties 
            WHERE id = property_images.property_id 
              AND created_by = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );
      
      CREATE POLICY IF NOT EXISTS "Users can delete images for their properties" ON property_images
        FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM properties 
            WHERE id = property_images.property_id 
              AND created_by = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );
    `;

    // Note: Supabase client doesn't support raw SQL execution directly
    // We need to use RPC or handle this differently
    
    // For now, let's return the SQL that needs to be executed
    return NextResponse.json({ 
      message: 'Please execute the following SQL in Supabase SQL editor',
      sql: migrationSQL,
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Paste and execute the provided SQL',
        '4. The RLS policies will be updated to allow image uploads'
      ]
    });
    
  } catch (error) {
    console.error('Error fixing RLS:', error);
    return NextResponse.json(
      { error: 'Failed to fix RLS policies' },
      { status: 500 }
    );
  }
}