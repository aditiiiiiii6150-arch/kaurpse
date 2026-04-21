import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Wraps children behind authentication.
 * Pass role="owner" to additionally restrict to owners only.
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();

  // Notify on unauthorized once
  useEffect(() => {
    if (!user) toast.info('Please login to continue');
    else if (role && user.role !== role) toast.error(`This area is only for ${role}s`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600 text-2xl font-bold">!</div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink">Access denied</h2>
        <p className="mt-2 text-ink-muted">
          This page is only accessible to <strong>{role}s</strong>.
        </p>
        <Link to="/" className="btn-primary mt-6">Go home</Link>
      </div>
    );
  }

  return children;
}
