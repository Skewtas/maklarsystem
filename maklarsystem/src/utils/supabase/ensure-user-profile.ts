import { createAdminClient } from './admin';

/**
 * Ensures a user profile exists for the given user
 * Creates one with default 'agent' role if it doesn't exist
 */
export async function ensureUserProfile(userId: string, email?: string) {
  const admin = createAdminClient();
  
  // Check if profile exists
  const { data: existingProfile } = await admin
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  if (!existingProfile) {
    // Determine role based on email
    let role = 'agent';
    if (email && (
      email === 'admin@maklarsystem.se' || 
      email === 'rani.shakir@matchahem.se' || 
      email === 'rani.shakir@hotmail.com'
    )) {
      role = 'admin';
    }
    
    // Create profile
    await admin
      .from('user_profiles')
      .insert({
        user_id: userId,
        role: role
      })
      .single();
  }
  
  return true;
}