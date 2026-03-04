// frontend/src/pages/MailSettings.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MailSettings.css';

/**
 * メール設定画面
 * 送信元アドレス管理を行う（SMTP設定はapplication.ymlで管理）
 */
const MailSettings = () => {
  // タブの状態（送信元アドレス管理）
  const [activeTab, setActiveTab] = useState('senders');

  // 送信元アドレスリスト
  const [senderEmails, setSenderEmails] = useState([]);

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

  // エラーメッセージ・ローディング状態
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 画面表示時に送信元アドレス一覧を取得
  useEffect(() => {
    fetchSenderEmails();
  }, []);

  // 送信元アドレス一覧をAPIから取得
  const fetchSenderEmails = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/sender-emails');
      setSenderEmails(response.data);
    } catch (err) {
      setError('送信元アドレスの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  // 送信元アドレスを新規作成 or 更新してDBに保存
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingEmail) {
        // 既存アドレスを更新
        await api.put(`/api/sender-emails/${editingEmail.id}`, formData);
      } else {
        // 新規アドレスを作成
        await api.post('/api/sender-emails', formData);
      }
      // 保存後に一覧を再取得して画面を更新
      await fetchSenderEmails();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || '保存に失敗しました');
    }
  };

  // 送信元アドレスをDBから削除
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      await api.delete(`/api/sender-emails/${id}`);
      // 削除後に一覧を再取得して画面を更新
      await fetchSenderEmails();
    } catch (err) {
      setError(err.response?.data?.message || '削除に失敗しました');
    }
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
      </div>

      {/* エラーメッセージ */}
      {error && <div className="error-message">{error}</div>}

      {/* 送信元アドレス管理タブ */}
      {activeTab === 'senders' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>送信元アドレス一覧</h2>
            <button className="btn btn-primary" onClick={handleAddNew}>
              新規追加
            </button>
          </div>

          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : (
            <div className="sender-list">
              {senderEmails.length === 0 ? (
                <p className="empty-message">
                  送信元アドレスが登録されていません。新規追加してください。
                </p>
              ) : (
                senderEmails.map((email) => (
                  <div key={email.id} className="sender-card">
                    <div className="sender-info">
                      <div className="sender-email">
                        {email.email}
                        {/* デフォルトフラグと有効フラグをバッジで表示 */}
                        {email.isDefault && <span className="badge default">デフォルト</span>}
                        {!email.isActive && <span className="badge inactive">無効</span>}
                      </div>
                      <div className="sender-name">{email.displayName}</div>
                    </div>
                    <div className="sender-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(email)}
                      >
                        編集
                      </button>
                      {/* デフォルトアドレスは削除不可 */}
                      {!email.isDefault && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(email.id)}
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 送信元アドレス追加/編集モーダル */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingEmail ? '送信元アドレスを編集' : '送信元アドレスを追加'}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>メールアドレス *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info@example.com"
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
                  placeholder="株式会社〇〇"
                  required
                />
              </div>

              {/* デフォルト設定チェックボックス */}
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                  />
                  デフォルトの送信元アドレスに設定する
                </label>
              </div>

              {/* 有効/無効チェックボックス */}
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
                <button type="submit" className="btn btn-primary">
                  {editingEmail ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  キャンセル
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