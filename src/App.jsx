import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Company from './pages/Company'
import './index.css'

const queryClient = new QueryClient()

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const StaffRoute = ({ children }) => {
  const { isStaff, isLoading } = useAuth()
  if (isLoading) return null
  return isStaff ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/documents" element={<PrivateRoute><StaffRoute><Documents /></StaffRoute></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/company" element={<PrivateRoute><StaffRoute><Company /></StaffRoute></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
