import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('REP');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = '新規登録 - PRM Tool';
  }, []);

  // メールアドレス形式チェック
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // パスワード形式チェック（英数字6文字以上、英字1文字以上、数字1文字以上）
  const isValidPassword = (password) => {
    // 6文字以上
    if (password.length < 6) {
      return { valid: false, message: 'パスワードは6文字以上で入力してください' };
    }
    
    // 英字が含まれているか
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasLetter) {
      return { valid: false, message: 'パスワードには英字を1文字以上含めてください' };
    }
    
    // 数字が含まれているか
    const hasNumber = /[0-9]/.test(password);
    if (!hasNumber) {
      return { valid: false, message: 'パスワードには数字を1文字以上含めてください' };
    }
    
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // メールアドレス形式チェック
    if (!isValidEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    // パスワード形式チェック
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    // パスワード一致チェック
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 409 || err.response?.status === 400) {
        // 重複メールアドレスエラー
        setError('このメールアドレスは既に登録されています');
      } else {
        setError('登録に失敗しました。もう一度お試しください。');
      }
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">新規登録</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="英数字6文字以上"
            />
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
              ※英字1文字以上、数字1文字以上を含む6文字以上
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">パスワード（確認）</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
              placeholder="もう一度入力"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">ロール</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option value="ADMIN">管理者</option>
              <option value="REP">担当者</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>

        <p className="auth-link-text">
          既にアカウントをお持ちの方は{' '}
          <Link to="/login" className="auth-link">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;