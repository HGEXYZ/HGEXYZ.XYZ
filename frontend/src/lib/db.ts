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

const users = new Map<string, User>()

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const normalized = email.toLowerCase()
  for (const user of Array.from(users.values())) {
    if (user.email === normalized) return user
  }
  return undefined
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  for (const user of Array.from(users.values())) {
    if (user.username === username) return user
  }
  return undefined
}

export async function findUserById(id: string): Promise<User | undefined> {
  return users.get(id)
}

export async function createUser(user: User): Promise<User> {
  users.set(user.id, user)
  return user
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const user = users.get(id)
  if (!user) return undefined
  const updated = { ...user, ...updates }
  users.set(id, updated)
  return updated
}
