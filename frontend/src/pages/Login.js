import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

// ログインページコンポーネント
const Login = () => {
  const navigate = useNavigate();// ナビゲーションフック
  const { login } = useAuth();// 認証コンテキストからログイン関数を取得
  const [formData, setFormData] = useState({ // フォームデータの状態管理
    loginId: '',
    password: '',
  });
  const [error, setError] = useState('');// エラーメッセージの状態管理
  const [loading, setLoading] = useState(false);// ローディング状態の管理

  // フォーム入力変更ハンドラー
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.loginId, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">PRM Tool</h1>
        <p className="login-subtitle">ログイン</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="loginId">ログインID</label>
            <input
              type="text"
              id="loginId"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;