import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
    
    // Skapa en enkel session cookie
    const sessionData = {
      email: user.email,
      name: user.name,
      authenticated: true,
      timestamp: new Date().toISOString()
    }
    
    const cookieStore = await cookies()
    cookieStore.set('temp-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Temp auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('temp-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false })
    }
    
    const sessionData = JSON.parse(sessionCookie.value)
    
    return NextResponse.json({
      authenticated: true,
      user: {
        email: sessionData.email,
        name: sessionData.name
      }
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('temp-session')
  
  return NextResponse.json({ success: true })
}