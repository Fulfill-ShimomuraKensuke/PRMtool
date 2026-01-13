import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Accounts from './pages/Accounts';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 公開ルート */}
            <Route path="/login" element={<Login />} />

            {/* 認証必要ルート */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* 管理者のみルート */}
            <Route
              path="/partners"
              element={
                <PrivateRoute adminOnly={true}>
                  <Partners />
                </PrivateRoute>
              }
            />

            {/* 認証必要ルート - 案件一覧 */}
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              }
            />

            {/* 認証必要ルート - 案件詳細 */}
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetail />
                </PrivateRoute>
              }
            />

            {/* 管理者のみルート - アカウント管理 */}
            <Route
              path="/accounts"
              element={
                <PrivateRoute adminOnly={true}>
                  <Accounts />
                </PrivateRoute>
              }
            />

            {/* デフォルトルート */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;