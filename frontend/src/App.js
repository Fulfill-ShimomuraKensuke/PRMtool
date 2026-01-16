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

// ルートリダイレクト（ロールに応じて適切なページへリダイレクト）
const RootRedirect = () => {
  const { isSystem } = useAuth();
  return <Navigate to={isSystem ? '/accounts' : '/'} replace />;
};

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

// アプリケーションのメインコンテンツ
function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}

      <Routes>
        {/* ログインページ */}
        <Route path="/login" element={<Login />} />

        {/* ダッシュボード（SYSTEMロールは制限） */}
        <Route
          path="/"
          element={
            <PrivateRoute systemRestricted={true}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* パートナー管理（SYSTEMロールは制限） */}
        <Route
          path="/partners"
          element={
            <PrivateRoute systemRestricted={true}>
              <Partners />
            </PrivateRoute>
          }
        />

        {/* パートナー別ダッシュボード */}
        <Route
          path="/partners/:id/dashboard"
          element={
            <PrivateRoute systemRestricted={true}>
              <PartnerDashboard />
            </PrivateRoute>
          }
        />

        {/* 案件管理（SYSTEMロールは制限） */}
        <Route
          path="/projects"
          element={
            <PrivateRoute systemRestricted={true}>
              <Projects />
            </PrivateRoute>
          }
        />

        {/* 案件詳細（SYSTEMロールは制限） */}
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute systemRestricted={true}>
              <ProjectDetail />
            </PrivateRoute>
          }
        />

        {/* 手数料管理 */}
        <Route
          path="/commissions"
          element={
            <PrivateRoute systemRestricted={true}>
              <Commissions />
            </PrivateRoute>
          }
        />

        {/* 請求書管理 */}
        <Route
          path="/invoices"
          element={
            <PrivateRoute systemRestricted={true}>
              <Invoices />
            </PrivateRoute>
          }
        />

        {/* アカウント管理（SYSTEM と ADMIN のみ） */}
        <Route
          path="/accounts"
          element={
            <PrivateRoute requiredRole="SYSTEM">
              <Accounts />
            </PrivateRoute>
          }
        />

        {/* ワイルドカードルートは必ず最後に配置 */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

export default App;