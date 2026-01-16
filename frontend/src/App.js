import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Accounts from './pages/Accounts';
import Commissions from './pages/Commissions';
import Invoices from './pages/Invoices';
import PartnerDashboard from './pages/PartnerDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute systemRestricted={true}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/partners"
          element={
            <PrivateRoute systemRestricted={true}>
              <Partners />
            </PrivateRoute>
          }
        />

        <Route
          path="/partners/:id/dashboard"
          element={
            <PrivateRoute>
              <PartnerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute systemRestricted={true}>
              <Projects />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <PrivateRoute systemRestricted={true}>
              <ProjectDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/commissions"
          element={
            <PrivateRoute systemRestricted={true}>
              <Commissions />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <PrivateRoute systemRestricted={true}>
              <Invoices />
            </PrivateRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <PrivateRoute requiredRole="SYSTEM">
              <Accounts />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;