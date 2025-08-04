import { NextResponse } from 'next/server'

// Enkelt minne för sessioner (för demo)
const sessions = new Map()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // För demo - hårdkodade användare
    const validUsers = [
      { email: 'test@maklarsystem.se', password: 'Test123!', name: 'Test Användare' },
      { email: 'demo@maklarsystem.se', password: 'Demo123!', name: 'Demo Användare' },
      { email: 'rani.shakir@hotmail.com', password: 'Welcome123!', name: 'Rani Shakir' },
    ]
    
    const user = validUsers.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generera en enkel session token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
    
    // Spara session i minnet
    sessions.set(token, {
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString()
    })
    
    // Skapa response med token i header
    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name
      },
      token: token
    })
    
    // Sätt cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // För lokal utveckling
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Simple auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1]
    
    if (!token || !sessions.has(token)) {
      return NextResponse.json({ authenticated: false })
    }
    
    const sessionData = sessions.get(token)
    
    return NextResponse.json({
      authenticated: true,
      user: sessionData
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}