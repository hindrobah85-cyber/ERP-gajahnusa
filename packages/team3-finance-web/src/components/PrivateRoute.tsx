import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null // Or a loading spinner
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default PrivateRoute