import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// 認証コンテキストの作成
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // ユーザー情報の状態管理
  const [loading, setLoading] = useState(true); // ローディング状態の管理

  // 初期化処理（トークンの有効性チェック）
  useEffect(() => {
    if (authService.isTokenExpired && authService.isTokenExpired()) {
      authService.logout();
      setUser(null);
      setLoading(false);
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // ログイン処理
  const login = async (loginId, password) => {
    const userData = await authService.login(loginId, password);
    setUser(userData);
    return userData;
  };

  // ログアウト処理
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // コンテキストの値（各ロールの判定を含む）
  const value = {
    user,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated,
    isSystem: user?.role === 'SYSTEM', // SYSTEMロール判定（アカウント管理のみ）
    isAdmin: user?.role === 'ADMIN',   // ADMINロール判定（全機能アクセス可能）
    isRep: user?.role === 'REP',       // REPロール判定（限定的な機能のみ）
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// カスタムフックでコンテキストを利用
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
