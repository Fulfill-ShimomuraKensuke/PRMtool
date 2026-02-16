import React, { useState, useEffect } from 'react';
import './MailSettings.css';

/**
 * メール設定画面
 * 送信元アドレス管理とSMTP設定を行う
 */
const MailSettings = () => {
  // タブの状態（送信元アドレス管理 or SMTP設定）
  const [activeTab, setActiveTab] = useState('senders');

  // 送信元アドレスリスト
  const [senderEmails, setSenderEmails] = useState([]);

  // SMTP設定
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    fromEmail: '',
    fromName: ''
  });

  // モーダルの表示状態
  const [showModal, setShowModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);

  // フォームデータ
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    isDefault: false,
    isActive: true
  });

  // エラーメッセージ
  const [error, setError] = useState('');

  // 送信元アドレス一覧を取得（APIから取得する想定）
  useEffect(() => {
    fetchSenderEmails();
    fetchSmtpConfig();
  }, []);

  // 送信元アドレス一覧を取得
  const fetchSenderEmails = async () => {
    // TODO: APIから取得
    // 仮データ
    setSenderEmails([
      {
        id: '1',
        email: 'info@mycompany.com',
        displayName: '株式会社サンプル',
        isDefault: true,
        isActive: true
      },
      {
        id: '2',
        email: 'accounting@mycompany.com',
        displayName: '経理部',
        isDefault: false,
        isActive: true
      }
    ]);
  };

  // SMTP設定を取得
  const fetchSmtpConfig = async () => {
    // TODO: APIから取得
    // 仮データ
    setSmtpConfig({
      host: 'smtp.gmail.com',
      port: '587',
      username: 'your-email@gmail.com',
      password: '********',
      fromEmail: 'info@mycompany.com',
      fromName: 'PRM Tool'
    });
  };

  // 新規追加モーダルを開く
  const handleAddNew = () => {
    setEditingEmail(null);
    setFormData({
      email: '',
      displayName: '',
      isDefault: false,
      isActive: true
    });
    setShowModal(true);
  };

  // 編集モーダルを開く
  const handleEdit = (email) => {
    setEditingEmail(email);
    setFormData({
      email: email.email,
      displayName: email.displayName,
      isDefault: email.isDefault,
      isActive: email.isActive
    });
    setShowModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmail(null);
    setError('');
  };

  // フォーム入力変更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 送信元アドレスを保存
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingEmail) {
        // TODO: 更新API呼び出し
        console.log('更新:', formData);
      } else {
        // TODO: 新規作成API呼び出し
        console.log('新規作成:', formData);
      }
      await fetchSenderEmails();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || '保存に失敗しました');
    }
  };

  // 送信元アドレスを削除
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      // TODO: 削除API呼び出し
      console.log('削除:', id);
      await fetchSenderEmails();
    } catch (err) {
      setError(err.response?.data?.message || '削除に失敗しました');
    }
  };

  // SMTP設定を保存
  const handleSaveSmtpConfig = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: SMTP設定保存API呼び出し
      console.log('SMTP設定保存:', smtpConfig);
      alert('SMTP設定を保存しました');
    } catch (err) {
      setError(err.response?.data?.message || 'SMTP設定の保存に失敗しました');
    }
  };

  // SMTP設定変更
  const handleSmtpChange = (e) => {
    const { name, value } = e.target;
    setSmtpConfig({
      ...smtpConfig,
      [name]: value
    });
  };

  return (
    <div className="mail-settings-container">
      <h1>メール設定</h1>

      {/* タブメニュー */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'senders' ? 'active' : ''}`}
          onClick={() => setActiveTab('senders')}
        >
          送信元アドレス管理
        </button>
        <button
          className={`tab ${activeTab === 'smtp' ? 'active' : ''}`}
          onClick={() => setActiveTab('smtp')}
        >
          SMTP設定
        </button>
      </div>

      {/* 送信元アドレス管理タブ */}
      {activeTab === 'senders' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>送信元アドレス管理</h2>
            <button className="btn btn-primary" onClick={handleAddNew}>
              + 新規追加
            </button>
          </div>

          <div className="sender-list">
            {senderEmails.map((email) => (
              <div key={email.id} className="sender-card">
                <div className="sender-info">
                  <div className="sender-email">
                    {email.email}
                    {email.isDefault && <span className="badge default">デフォルト</span>}
                    {!email.isActive && <span className="badge inactive">無効</span>}
                  </div>
                  <div className="sender-name">{email.displayName}</div>
                </div>
                <div className="sender-actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(email)}>
                    編集
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(email.id)}
                    disabled={email.isDefault}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMTP設定タブ */}
      {activeTab === 'smtp' && (
        <div className="tab-content">
          <h2>SMTP設定</h2>
          <form onSubmit={handleSaveSmtpConfig} className="smtp-form">
            <div className="form-group">
              <label>SMTPホスト *</label>
              <input
                type="text"
                name="host"
                value={smtpConfig.host}
                onChange={handleSmtpChange}
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>SMTPポート *</label>
              <input
                type="number"
                name="port"
                value={smtpConfig.port}
                onChange={handleSmtpChange}
                placeholder="587"
                required
              />
            </div>

            <div className="form-group">
              <label>ユーザー名 *</label>
              <input
                type="text"
                name="username"
                value={smtpConfig.username}
                onChange={handleSmtpChange}
                placeholder="your-email@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>パスワード *</label>
              <input
                type="password"
                name="password"
                value={smtpConfig.password}
                onChange={handleSmtpChange}
                placeholder="アプリパスワード"
                required
              />
            </div>

            <div className="form-group">
              <label>デフォルト送信元メールアドレス *</label>
              <input
                type="email"
                name="fromEmail"
                value={smtpConfig.fromEmail}
                onChange={handleSmtpChange}
                placeholder="info@mycompany.com"
                required
              />
            </div>

            <div className="form-group">
              <label>デフォルト送信元名 *</label>
              <input
                type="text"
                name="fromName"
                value={smtpConfig.fromName}
                onChange={handleSmtpChange}
                placeholder="PRM Tool"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary">
              設定を保存
            </button>
          </form>
        </div>
      )}

      {/* 送信元アドレス追加/編集モーダル */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingEmail ? '送信元アドレス編集' : '送信元アドレス追加'}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>メールアドレス *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>表示名 *</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="株式会社サンプル"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                  />
                  デフォルトに設定
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  有効
                </label>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmail ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailSettings;