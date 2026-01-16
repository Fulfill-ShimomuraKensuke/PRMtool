import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isSystem, isAdmin, isRep } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ログアウト処理
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // アクティブなリンクのクラス名を取得
  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // ロールを日本語表示に変換
  const getRoleLabel = (role) => {
    switch (role) {
      case 'SYSTEM':
        return 'システム管理者';
      case 'ADMIN':
        return '管理者';
      case 'REP':
        return '担当者';
      default:
        return role;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          PRM Tool
        </Link>

        <div className="navbar-menu">
          {/* SYSTEMロールの場合はアカウント管理のみ表示 */}
          {isSystem && (
            <Link to="/accounts" className={`navbar-link ${getActiveClass('/accounts')}`}>
              アカウント管理
            </Link>
          )}

          {/* ADMIN と REP はダッシュボード、パートナー、案件にアクセス可能 */}
          {(isAdmin || isRep) && (
            <>
              <Link to="/" className={`navbar-link ${getActiveClass('/')}`}>
                ダッシュボード
              </Link>
              <Link to="/partners" className={`navbar-link ${getActiveClass('/partners')}`}>
                パートナー
              </Link>
              <Link to="/projects" className={`navbar-link ${getActiveClass('/projects')}`}>
                案件
              </Link>
            </>
          )}

          {/* ADMIN のみアカウント管理にアクセス可能 */}
          {isAdmin && (
            <Link to="/accounts" className={`navbar-link ${getActiveClass('/accounts')}`}>
              アカウント管理
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            {user?.name} ({getRoleLabel(user?.role)})
          </span>
          <button onClick={handleLogout} className="navbar-logout-btn">
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
