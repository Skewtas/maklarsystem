import { NextRequest, NextResponse } from 'next/server';
import { doubleSubmitCSRF } from '@/lib/security/csrf';

export async function GET(req: NextRequest) {
  // Generate new CSRF token
  const token = doubleSubmitCSRF.generateToken();
  
  // Create response
  const response = NextResponse.json({ token });
  
  // Add token to response (sets cookie and header)
  doubleSubmitCSRF.addTokenToResponse(response, token);
  
  return response;
}