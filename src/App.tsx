/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import MenteeDashboard from './components/MenteeDashboard';
import MentorDashboard from './components/MentorDashboard';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!profile?.isProfileComplete && window.location.pathname !== '/setup') {
    return <Navigate to="/setup" />;
  }

  if (allowedRole && profile?.role !== allowedRole) {
    return <Navigate to={profile?.role === 'mentor' ? '/mentor' : '/mentee'} />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/setup" 
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentee" 
            element={
              <ProtectedRoute allowedRole="mentee">
                <MenteeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentor" 
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
