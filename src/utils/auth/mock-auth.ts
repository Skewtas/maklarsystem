// Temporär mock-autentisering för utveckling
// Detta ersätts med riktig Supabase-autentisering senare

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'admin' | 'user';
  company?: string;
}

// Hårdkodad testanvändare
const mockUser: MockUser = {
  id: '1',
  email: 'test@maklare.se',
  name: 'Test Mäklare',
  role: 'agent',
  company: 'Testmäklarna AB'
};

export const mockAuth = {
  user: mockUser,
  isAuthenticated: true,
  
  // Placeholder-funktioner för framtida implementation
  login: async (email: string, password: string) => {
    console.log('TODO: Implementera login med Supabase');
    return { user: mockUser, error: null };
  },
  
  logout: async () => {
    console.log('TODO: Implementera logout med Supabase');
    return { error: null };
  },
  
  register: async (email: string, password: string, name: string) => {
    console.log('TODO: Implementera registrering med Supabase');
    return { user: mockUser, error: null };
  }
};