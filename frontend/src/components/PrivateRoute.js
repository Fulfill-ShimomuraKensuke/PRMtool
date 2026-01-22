import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 認証が必要なルートを保護するコンポーネント
 * ロールベースのアクセス制御を実装
 */
const PrivateRoute = ({ children, requiredRole, systemRestricted }) => {
  const { user, loading, isSystem, isAdmin, isAccounting, isRep } = useAuth();

  // ローディング中は何も表示しない
  if (loading) {
    return <div>Loading...</div>;
  }

  // 未ログインの場合はログインページへリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // SYSTEMロールが制限されているページにアクセスしようとした場合
  if (systemRestricted && isSystem) {
    return <Navigate to="/accounts" replace />;
  }

  // 特定のロールが必要な場合のチェック
  if (requiredRole) {
    // ADMIN権限が必要な場合（SYSTEMまたはADMINロールがアクセス可能）
    if (requiredRole === 'ADMIN' && !isAdmin && !isSystem) {
      return <Navigate to="/" replace />;
    }

    // ACCOUNTING権限が必要な場合（ACCOUNTINGおよびADMINがアクセス可能）
    if (requiredRole === 'ACCOUNTING' && !isAccounting && !isAdmin) {
      return <Navigate to="/" replace />;
    }

    // REP権限が必要な場合（REP、ACCOUNTING、ADMINがアクセス可能、SYSTEMは除外）
    if (requiredRole === 'REP' && !isRep && !isAccounting && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // 全てのチェックをパスした場合、子コンポーネントを表示
  return children;
};

export default PrivateRoute;