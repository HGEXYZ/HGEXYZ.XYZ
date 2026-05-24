import fs from 'fs/promises'
import path from 'path'

export interface User {
  id: string
  username: string
  email: string
  password: string
  avatar: string
  createdAt: string
  lastLogin: string
  role: string
  subscriptionPlan: string
}

interface DbData {
  users: User[]
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { users: [] }
  }
}

async function writeDb(data: DbData): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const db = await readDb()
  return db.users.find((u) => u.email === email.toLowerCase())
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const db = await readDb()
  return db.users.find((u) => u.username === username)
}

export async function findUserById(id: string): Promise<User | undefined> {
  const db = await readDb()
  return db.users.find((u) => u.id === id)
}

export async function createUser(user: User): Promise<User> {
  const db = await readDb()
  db.users.push(user)
  await writeDb(db)
  return user
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const db = await readDb()
  const index = db.users.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  db.users[index] = { ...db.users[index], ...updates }
  await writeDb(db)
  return db.users[index]
}
