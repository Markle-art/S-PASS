import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../data/users';

interface Props {
  role: Role;
  children: ReactNode;
}

export default function RoleGuard({ role, children }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user!.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
