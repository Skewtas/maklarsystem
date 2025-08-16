import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createAdminClient();
    
    // Create user profiles for all existing auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const profiles = [];
    for (const user of authUsers.users) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Determine role based on email
        let role = 'agent';
        if (user.email === 'admin@maklarsystem.se' || 
            user.email === 'rani.shakir@matchahem.se' || 
            user.email === 'rani.shakir@hotmail.com') {
          role = 'admin';
        }

        // Create profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            role: role
          })
          .select()
          .single();

        if (!error) {
          profiles.push(data);
        }
      }
    }

    return NextResponse.json({ 
      message: `Created ${profiles.length} user profiles`,
      profiles 
    });
    
  } catch (error) {
    console.error('Error creating user profiles:', error);
    return NextResponse.json(
      { error: 'Failed to create user profiles' },
      { status: 500 }
    );
  }
}