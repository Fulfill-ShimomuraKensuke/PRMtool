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
import CommissionRules from './pages/CommissionRules';
import Invoices from './pages/Invoices';
import InvoiceTemplates from './pages/InvoiceTemplates';
import PartnerDashboard from './pages/PartnerDashboard';
import InvoiceTemplateEditor from './pages/InvoiceTemplateEditor';
import MailSettings from './pages/MailSettings'; // 新規追加
import Contents from './pages/Contents'; // 新規追加
import ContentShares from './pages/ContentShares'; // 新規追加

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
        {/* ログイン画面 */}
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
            <PrivateRoute>
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

        {/* 手数料管理（SYSTEMロールは制限） */}
        <Route
          path="/commissions"
          element={
            <PrivateRoute systemRestricted={true}>
              <CommissionRules />
            </PrivateRoute>
          }
        />

        {/* 請求書管理（SYSTEMロールは制限） */}
        <Route
          path="/invoices"
          element={
            <PrivateRoute systemRestricted={true}>
              <Invoices />
            </PrivateRoute>
          }
        />

        {/* 請求書テンプレート管理（SYSTEMロールは制限） */}
        <Route
          path="/invoice-templates"
          element={
            <PrivateRoute systemRestricted={true}>
              <InvoiceTemplates />
            </PrivateRoute>
          }
        />

        {/* 請求書テンプレート新規作成（SYSTEMロールは制限） */}
        <Route
          path="/invoice-templates/new"
          element={
            <PrivateRoute systemRestricted={true}>
              <InvoiceTemplateEditor />
            </PrivateRoute>
          }
        />

        {/* 請求書テンプレート編集（SYSTEMロールは制限） */}
        <Route
          path="/invoice-templates/edit/:id"
          element={
            <PrivateRoute systemRestricted={true}>
              <InvoiceTemplateEditor />
            </PrivateRoute>
          }
        />

        {/* ========================================
            新規追加: メール設定
            SYSTEMとADMINのみアクセス可能
            ======================================== */}
        <Route
          path="/mail-settings"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <MailSettings />
            </PrivateRoute>
          }
        />

        {/* ========================================
            新規追加: コンテンツ管理（ファイル倉庫）
            ADMIN、ACCOUNTING、REPがアクセス可能（SYSTEMは制限）
            ======================================== */}
        <Route
          path="/contents"
          element={
            <PrivateRoute systemRestricted={true}>
              <Contents />
            </PrivateRoute>
          }
        />

        {/* ========================================
            新規追加: コンテンツ共有管理
            ADMIN、ACCOUNTING、REPがアクセス可能（SYSTEMは制限）
            ======================================== */}
        <Route
          path="/content-shares"
          element={
            <PrivateRoute systemRestricted={true}>
              <ContentShares />
            </PrivateRoute>
          }
        />

        {/* アカウント管理（SYSTEMとADMINのみアクセス可能） */}
        <Route
          path="/accounts"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <Accounts />
            </PrivateRoute>
          }
        />

        {/* 未定義のルートはダッシュボードにリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;