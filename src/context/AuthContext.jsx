import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../services/api'

const AuthContext = createContext({ user: null, isLoading: true, isError: false, isAdmin: false, refetchUser: () => {} })

const roleName = (role) => (typeof role === 'string' ? role : role?.name || '')

export function AuthProvider({ children }) {
  const token = localStorage.getItem('token')

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await getCurrentUser()
      return data
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const isAdmin = (user?.roles || []).some((r) => roleName(r).toUpperCase().includes('ADMIN'))
  const organizationId = user?.organization?.id ?? user?.organizationId ?? null

  return (
    <AuthContext.Provider value={{ user, isLoading, isError, isAdmin, organizationId, refetchUser: refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
