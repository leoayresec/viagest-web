export type UserProfile = 'admin' | 'apontador'

export interface User {
  id: string
  login: string
  name: string
  profile: UserProfile
}
