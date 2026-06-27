export type UserProfile = 'admin' | 'apontador'

export interface User {
  login: string
  name: string
  profile: UserProfile
}

export interface StoredUser {
  login: string
  password: string
  name: string
  profile: UserProfile
  active: boolean
}
