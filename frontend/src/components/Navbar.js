import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/**
 * ナビゲーションバーコンポーネント
 * ロールに応じてメニュー表示を制御
 * ロゴクリックでダッシュボードに戻るため、ダッシュボードリンクは不要
 */
const Navbar = () => {
  const { user, logout, isSystem, isAdmin, isAccounting, isRep } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ドロップダウンの開閉状態
  const [openDropdown, setOpenDropdown] = useState(null);

  // ドロップダウンの参照（外部クリック検知用）
  const dropdownRef = useRef(null);

  // ログアウト処理
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // アクティブなリンクのクラス名を取得
  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // ドロップダウンがアクティブかチェック（配下のパスも含む）
  const isDropdownActive = (paths) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  // ドロップダウンのトグル
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // ドロップダウンを閉じる
  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // ロールを日本語表示に変換
  const getRoleLabel = (role) => {
    switch (role) {
      case 'SYSTEM':
        return 'システム管理者';
      case 'ADMIN':
        return '管理者';
      case 'ACCOUNTING':
        return '会計担当';
      case 'REP':
        return '担当者';
      default:
        return role;
    }
  };

  // ルート変更時にドロップダウンを閉じる
  useEffect(() => {
    closeDropdown();
  }, [location.pathname]);

  // ドロップダウン外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ドロップダウンが開いていない場合は何もしない
      if (!openDropdown) return;

      // クリックされた要素がドロップダウン内かチェック
      const clickedElement = event.target;
      const isDropdownClick = clickedElement.closest('.navbar-dropdown');

      // ドロップダウン外をクリックした場合は閉じる
      if (!isDropdownClick) {
        closeDropdown();
      }
    };

    // イベントリスナーを追加
    document.addEventListener('mousedown', handleClickOutside);

    // クリーンアップ（コンポーネントのアンマウント時）
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ロゴ（ダッシュボードへのリンク） */}
        <Link to="/" className="navbar-logo" onClick={closeDropdown}>
          PRM Tool
        </Link>

        <div className="navbar-menu">
          {/* ========================================
              SYSTEMロール: メール設定とアカウント管理を直接表示
              ======================================== */}
          {isSystem && (
            <>
              <Link
                to="/mail-settings"
                className={`navbar-link ${getActiveClass('/mail-settings')}`}
                onClick={closeDropdown}
              >
                メール設定
              </Link>
              <Link
                to="/accounts"
                className={`navbar-link ${getActiveClass('/accounts')}`}
                onClick={closeDropdown}
              >
                アカウント管理
              </Link>
            </>
          )}

          {/* ========================================
              ADMIN、ACCOUNTING、REP: 業務機能
              ======================================== */}
          {(isAdmin || isAccounting || isRep) && (
            <>
              <Link
                to="/partners"
                className={`navbar-link ${getActiveClass('/partners')}`}
                onClick={closeDropdown}
              >
                パートナー
              </Link>

              <Link
                to="/projects"
                className={`navbar-link ${getActiveClass('/projects')}`}
                onClick={closeDropdown}
              >
                案件
              </Link>

              <Link
                to="/commissions"
                className={`navbar-link ${getActiveClass('/commissions')}`}
                onClick={closeDropdown}
              >
                手数料管理
              </Link>

              {/* 請求管理ドロップダウン */}
              <div className="navbar-dropdown">
                <button
                  className={`navbar-link dropdown-toggle ${isDropdownActive(['/invoices']) ? 'active' : ''}`}
                  onClick={() => toggleDropdown('billing')}
                >
                  請求管理 ▼
                </button>
                {openDropdown === 'billing' && (
                  <div className="dropdown-menu">
                    <Link
                      to="/invoices"
                      className="dropdown-item"
                      onClick={closeDropdown}
                    >
                      請求書
                    </Link>
                  </div>
                )}
              </div>

              {/* コンテンツ管理ドロップダウン */}
              <div className="navbar-dropdown">
                <button
                  className={`navbar-link dropdown-toggle ${isDropdownActive(['/contents', '/content-shares']) ? 'active' : ''}`}
                  onClick={() => toggleDropdown('content')}
                >
                  コンテンツ管理 ▼
                </button>
                {openDropdown === 'content' && (
                  <div className="dropdown-menu">
                    <Link
                      to="/contents"
                      className="dropdown-item"
                      onClick={closeDropdown}
                    >
                      ファイル倉庫
                    </Link>
                    <Link
                      to="/content-shares"
                      className="dropdown-item"
                      onClick={closeDropdown}
                    >
                      共有管理
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================
              ADMIN のみ: システム設定ドロップダウン
              ======================================== */}
          {isAdmin && (
            <div className="navbar-dropdown">
              <button
                className={`navbar-link dropdown-toggle ${isDropdownActive(['/mail-settings', '/accounts']) ? 'active' : ''}`}
                onClick={() => toggleDropdown('system')}
              >
                システム設定 ▼
              </button>
              {openDropdown === 'system' && (
                <div className="dropdown-menu">
                  <Link
                    to="/mail-settings"
                    className="dropdown-item"
                    onClick={closeDropdown}
                  >
                    メール設定
                  </Link>
                  <Link
                    to="/accounts"
                    className="dropdown-item"
                    onClick={closeDropdown}
                  >
                    アカウント管理
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ユーザー情報とログアウト */}
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