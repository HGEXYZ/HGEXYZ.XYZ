import { NextResponse } from 'next/server'
import { hashPassword, signToken } from '@/lib/auth'
import { createUser, findUserByEmail, findUserByUsername } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existingEmail = await findUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const existingUsername = await findUserByUsername(username)
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const id = crypto.randomUUID()

    const user = await createUser({
      id,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: '',
      role: 'user',
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    })

    const token = await signToken({ userId: id, email: user.email })

    const res = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    })

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 604800,
    })

    return res
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
