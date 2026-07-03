import { createContext, useContext, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser } from '../services/api'

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isError: false,
  isAdmin: false,
  isAreaAdmin: false,
  isStaff: false,
  organizationId: null,
  areaId: null,
  areaName: null,
  refetchUser: () => {},
  setToken: () => {},
  logout: () => {},
})

const roleName = (role) => (typeof role === 'string' ? role : role?.name || '')

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  // El token vive en React state (no solo en localStorage) para que loguear/desloguear
  // dispare un re-render y la query de currentUser se vuelva a habilitar sin necesitar
  // un reload completo de la página.
  const [token, setTokenState] = useState(() => localStorage.getItem('token'))

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

  const setToken = useCallback((newToken) => {
    queryClient.clear()
    localStorage.setItem('token', newToken)
    setTokenState(newToken)
  }, [queryClient])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    queryClient.clear()
    setTokenState(null)
  }, [queryClient])

  const roleNames = (user?.roles || []).map((r) => roleName(r).toUpperCase())
  const isAdmin = roleNames.includes('ADMIN')
  const isAreaAdmin = roleNames.includes('AREA_ADMIN')
  const isStaff = isAdmin || isAreaAdmin
  const organizationId = user?.organization?.id ?? user?.organizationId ?? null
  const areaId = user?.area?.id ?? user?.areaId ?? null
  const areaName = user?.area?.name ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isError,
        isAdmin,
        isAreaAdmin,
        isStaff,
        organizationId,
        areaId,
        areaName,
        refetchUser: refetch,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
