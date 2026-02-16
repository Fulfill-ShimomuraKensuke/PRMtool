import React, { useState, useEffect } from 'react';
import invoiceDeliveryService from '../services/invoiceDeliveryService';
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
  const [loading, setLoading] = useState(false);

  /**
   * 初回読み込み時にデータを取得
   */
  useEffect(() => {
    document.title = 'メール設定 - PRM Tool';
    fetchSenderEmails();
    fetchSmtpConfig();
  }, []);

  /**
   * 送信元アドレス一覧を取得
   * バックエンドAPIから取得
   */
  const fetchSenderEmails = async () => {
    try {
      setLoading(true);
      const data = await invoiceDeliveryService.getAllSenderEmails();
      setSenderEmails(data);
    } catch (err) {
      console.error('送信元アドレス取得エラー:', err);
      setError('送信元アドレスの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * SMTP設定を取得
   * 注: 現状バックエンドにSMTP設定取得APIがないため、
   * application.ymlから読み込むか、環境変数で管理する
   * ここでは表示のみのプレースホルダーとして実装
   */
  const fetchSmtpConfig = async () => {
    // SMTP設定は環境変数で管理されているため、
    // 画面では参考情報として表示のみ
    setSmtpConfig({
      host: 'smtp.gmail.com または email-smtp.ap-northeast-1.amazonaws.com',
      port: '587',
      username: '環境変数で設定',
      password: '********',
      fromEmail: '環境変数で設定',
      fromName: '環境変数で設定'
    });
  };

  /**
   * 新規追加モーダルを開く
   */
  const handleAddNew = () => {
    setEditingEmail(null);
    setFormData({
      email: '',
      displayName: '',
      isDefault: false,
      isActive: true
    });
    setShowModal(true);
    setError('');
  };

  /**
   * 編集モーダルを開く
   */
  const handleEdit = (email) => {
    setEditingEmail(email);
    setFormData({
      email: email.email,
      displayName: email.displayName,
      isDefault: email.isDefault,
      isActive: email.isActive
    });
    setShowModal(true);
    setError('');
  };

  /**
   * モーダルを閉じる
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmail(null);
    setError('');
  };

  /**
   * フォーム入力変更
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  /**
   * 送信元アドレスを保存
   * 新規作成または更新
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!formData.email) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!formData.displayName) {
      setError('表示名を入力してください');
      return;
    }

    try {
      setLoading(true);

      if (editingEmail) {
        // 更新
        await invoiceDeliveryService.updateSenderEmail(editingEmail.id, formData);
      } else {
        // 新規作成
        await invoiceDeliveryService.createSenderEmail(formData);
      }

      await fetchSenderEmails();
      handleCloseModal();
    } catch (err) {
      console.error('保存エラー:', err);
      setError(err.response?.data?.message || '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 送信元アドレスを削除
   */
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      setLoading(true);
      await invoiceDeliveryService.deleteSenderEmail(id);
      await fetchSenderEmails();
    } catch (err) {
      console.error('削除エラー:', err);
      setError(err.response?.data?.message || '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * デフォルトに設定
   */
  const handleSetDefault = async (id) => {
    try {
      setLoading(true);
      await invoiceDeliveryService.setDefaultSenderEmail(id);
      await fetchSenderEmails();
    } catch (err) {
      console.error('デフォルト設定エラー:', err);
      setError(err.response?.data?.message || 'デフォルト設定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * SMTP設定を保存
   * 注: SMTP設定は環境変数で管理されるため、
   * 画面からの変更は推奨しない（参考情報のみ表示）
   */
  const handleSaveSmtpConfig = async (e) => {
    e.preventDefault();
    setError('');

    alert(
      'SMTP設定は環境変数で管理されています。\n\n' +
      '設定を変更する場合は、以下のファイルを編集してください：\n' +
      '- backend/src/main/resources/application.yml\n\n' +
      '開発環境: spring.mail.* の設定\n' +
      '本番環境: 環境変数 AWS_SES_SMTP_USERNAME, AWS_SES_SMTP_PASSWORD'
    );
  };

  /**
   * SMTP設定変更
   */
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

      {error && <div className="error-message">{error}</div>}

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
          <div className="tab-header">
            <h2>送信元メールアドレス</h2>
            <button onClick={handleAddNew} className="btn-primary">
              + 新規追加
            </button>
          </div>

          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : senderEmails.length === 0 ? (
            <div className="no-data">送信元メールアドレスが登録されていません</div>
          ) : (
            <div className="sender-list">
              {senderEmails.map((sender) => (
                <div key={sender.id} className="sender-card">
                  <div className="sender-info">
                    <div className="sender-header">
                      <h3>{sender.displayName}</h3>
                      <div className="sender-badges">
                        {sender.isDefault && (
                          <span className="badge badge-default">デフォルト</span>
                        )}
                        {sender.isActive ? (
                          <span className="badge badge-active">有効</span>
                        ) : (
                          <span className="badge badge-inactive">無効</span>
                        )}
                      </div>
                    </div>
                    <div className="sender-email">{sender.email}</div>
                    <div className="sender-meta">
                      作成日: {new Date(sender.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>

                  <div className="sender-actions">
                    {!sender.isDefault && (
                      <button
                        onClick={() => handleSetDefault(sender.id)}
                        className="btn-secondary"
                        disabled={loading}
                      >
                        デフォルトに設定
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(sender)}
                      className="btn-edit"
                      disabled={loading}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(sender.id)}
                      className="btn-delete"
                      disabled={loading || sender.isDefault}
                      title={sender.isDefault ? 'デフォルトのアドレスは削除できません' : ''}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SMTP設定タブ */}
      {activeTab === 'smtp' && (
        <div className="tab-content">
          <h2>SMTP設定</h2>
          <div className="info-message">
            <p>
              ℹ️ SMTP設定は環境変数で管理されています。
              設定を変更する場合は、サーバー管理者にお問い合わせください。
            </p>
          </div>

          <form onSubmit={handleSaveSmtpConfig} className="smtp-form">
            <div className="form-group">
              <label>SMTPホスト</label>
              <input
                type="text"
                name="host"
                value={smtpConfig.host}
                onChange={handleSmtpChange}
                placeholder="smtp.gmail.com"
                disabled
                readOnly
              />
              <small className="form-help">
                開発環境: smtp.gmail.com<br />
                本番環境: email-smtp.ap-northeast-1.amazonaws.com
              </small>
            </div>

            <div className="form-group">
              <label>SMTPポート</label>
              <input
                type="text"
                name="port"
                value={smtpConfig.port}
                onChange={handleSmtpChange}
                placeholder="587"
                disabled
                readOnly
              />
              <small className="form-help">
                通常は 587 (STARTTLS) または 465 (SSL/TLS)
              </small>
            </div>

            <div className="form-group">
              <label>ユーザー名</label>
              <input
                type="text"
                name="username"
                value={smtpConfig.username}
                onChange={handleSmtpChange}
                placeholder="your-email@gmail.com"
                disabled
                readOnly
              />
              <small className="form-help">
                環境変数: spring.mail.username
              </small>
            </div>

            <div className="form-group">
              <label>パスワード</label>
              <input
                type="password"
                name="password"
                value={smtpConfig.password}
                onChange={handleSmtpChange}
                placeholder="アプリパスワード"
                disabled
                readOnly
              />
              <small className="form-help">
                環境変数: spring.mail.password<br />
                Gmailの場合はアプリパスワードを使用
              </small>
            </div>

            <div className="form-group">
              <label>デフォルト送信元メールアドレス</label>
              <input
                type="text"
                name="fromEmail"
                value={smtpConfig.fromEmail}
                onChange={handleSmtpChange}
                placeholder="info@mycompany.com"
                disabled
                readOnly
              />
              <small className="form-help">
                環境変数: mail.from.email
              </small>
            </div>

            <div className="form-group">
              <label>デフォルト送信元名</label>
              <input
                type="text"
                name="fromName"
                value={smtpConfig.fromName}
                onChange={handleSmtpChange}
                placeholder="PRM Tool"
                disabled
                readOnly
              />
              <small className="form-help">
                環境変数: mail.from.name
              </small>
            </div>

            <div className="info-message">
              <h4>📝 設定変更手順</h4>
              <ol>
                <li>backend/src/main/resources/application.yml を編集</li>
                <li>開発環境の場合: spring.mail.* セクションを変更</li>
                <li>本番環境の場合: 環境変数を設定
                  <ul>
                    <li>AWS_SES_SMTP_USERNAME</li>
                    <li>AWS_SES_SMTP_PASSWORD</li>
                    <li>MAIL_FROM_EMAIL</li>
                    <li>MAIL_FROM_NAME</li>
                  </ul>
                </li>
                <li>アプリケーションを再起動</li>
              </ol>
            </div>

            <button type="submit" className="btn-primary">
              設定情報を確認
            </button>
          </form>
        </div>
      )}

      {/* 送信元アドレス追加/編集モーダル */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEmail ? '送信元アドレス編集' : '送信元アドレス追加'}</h3>
              <button onClick={handleCloseModal} className="close-button">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  メールアドレス <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info@company.com"
                  required
                  disabled={editingEmail !== null}
                />
                {editingEmail && (
                  <small className="form-help">
                    メールアドレスは変更できません
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  表示名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="株式会社サンプル"
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                  />
                  デフォルトに設定
                </label>
                <small className="form-help">
                  デフォルトに設定すると、メール送信時に自動的にこのアドレスが選択されます
                </small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  有効
                </label>
                <small className="form-help">
                  無効にすると、このアドレスは送信元として選択できなくなります
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-cancel"
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? '保存中...' : editingEmail ? '更新' : '作成'}
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
