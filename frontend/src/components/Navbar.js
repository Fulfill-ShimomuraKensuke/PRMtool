import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          PRM Tool
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/dashboard" className="navbar-link">
              ダッシュボード
            </Link>
          </li>

          {isAdmin && (
            <li className="navbar-item">
              <Link to="/partners" className="navbar-link">
                パートナー管理
              </Link>
            </li>
          )}

          <li className="navbar-item">
            <Link to="/projects" className="navbar-link">
              案件管理
            </Link>
          </li>
        </ul>

        <div className="navbar-user">
          <span className="navbar-user-email">{user?.email}</span>
          <span className="navbar-user-role">
            ({user?.role === 'ADMIN' ? '管理者' : '担当者'})
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