import React, { useState, useEffect } from 'react';
import './ContentShares.css';
import contentShareService from '../services/contentShareService';
import contentService from '../services/contentService';
import partnerService from '../services/partnerService';

/**
 * コンテンツ共有管理画面
 * ファイルの共有設定、共有履歴の管理
 */
const ContentShares = () => {
  // 共有リスト
  const [shares, setShares] = useState([]);

  // パートナー一覧
  const [partners, setPartners] = useState([]);

  // ファイル一覧
  const [files, setFiles] = useState([]);

  // モーダルの表示状態
  const [showShareModal, setShowShareModal] = useState(false);

  // フォームデータ
  const [formData, setFormData] = useState({
    fileId: '',
    shareTarget: 'SPECIFIC_PARTNER',
    partnerId: '',
    shareMethod: 'SYSTEM_LINK',
    expiresAt: '',
    downloadLimit: '',
    notifyOnDownload: false,
    message: '',
  });

  // エラーメッセージ
  const [error, setError] = useState('');

  // ローディング状態
  const [loading, setLoading] = useState(false);

  // 初期データ取得
  useEffect(() => {
    fetchShares();
    fetchPartners();
    fetchFiles();
  }, []);

  // 共有一覧を取得
  const fetchShares = async () => {
    try {
      setLoading(true);
      const data = await contentShareService.getAllShares();
      setShares(data);
    } catch (err) {
      setError('共有の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // パートナー一覧を取得
  const fetchPartners = async () => {
    try {
      const data = await partnerService.getPartners();
      setPartners(data);
    } catch (err) {
      console.error('パートナーの取得に失敗しました', err);
    }
  };

  // ファイル一覧を取得
  const fetchFiles = async () => {
    try {
      const data = await contentService.getAllFiles();
      setFiles(data);
    } catch (err) {
      console.error('ファイルの取得に失敗しました', err);
    }
  };

  // 共有モーダルを開く
  const handleOpenShareModal = () => {
    setFormData({
      fileId: '',
      shareTarget: 'SPECIFIC_PARTNER',
      partnerId: '',
      shareMethod: 'SYSTEM_LINK',
      expiresAt: '',
      downloadLimit: '',
      notifyOnDownload: false,
      message: '',
    });
    setError('');
    setShowShareModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowShareModal(false);
    setError('');
  };

  // フォーム入力変更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 共有対象タイプ変更時の処理
  const handleShareTargetChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      shareTarget: value,
      partnerId: value === 'ALL_PARTNERS' ? '' : prev.partnerId,
    }));
  };

  // 共有作成
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // バリデーション
      if (formData.shareTarget === 'SPECIFIC_PARTNER' && !formData.partnerId) {
        setError('パートナーを選択してください');
        return;
      }

      // 日付形式の変換（YYYY-MM-DD → ISO DateTime）
      const shareData = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        downloadLimit: formData.downloadLimit ? parseInt(formData.downloadLimit) : null,
        partnerId: formData.shareTarget === 'ALL_PARTNERS' ? null : formData.partnerId,
      };

      await contentShareService.createShare(shareData);

      // 共有リストを再取得
      await fetchShares();

      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || '共有の作成に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 共有を無効化
  const handleRevoke = async (shareId) => {
    if (!window.confirm('この共有を無効化してもよろしいですか？')) {
      return;
    }

    try {
      setLoading(true);
      await contentShareService.revokeShare(shareId);

      // 共有リストを再取得
      await fetchShares();
    } catch (err) {
      setError('共有の無効化に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ステータスバッジを取得
  const getStatusBadge = (status) => {
    const badgeClass = contentShareService.getStatusBadgeClass(status);
    const label = contentShareService.getStatusLabel(status);
    return <span className={`badge ${badgeClass}`}>{label}</span>;
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    return contentShareService.formatDate(dateString);
  };

  return (
    <div className="content-shares-container">
      {/* ヘッダー */}
      <div className="shares-header">
        <h1>コンテンツ共有</h1>
        <button className="btn btn-primary" onClick={handleOpenShareModal}>
          新規共有
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && <div className="error-message">{error}</div>}

      {/* ローディング */}
      {loading && <div className="loading">読み込み中...</div>}

      {/* 共有リスト */}
      <div className="shares-list">
        {shares.length === 0 ? (
          <div className="empty-state">
            <p>共有がありません</p>
          </div>
        ) : (
          shares.map((share) => (
            <div key={share.id} className="share-card">
              <div className="share-info">
                <div className="share-file">
                  <span className="file-icon">
                    {contentService.getFileIcon(share.fileType || 'application/pdf')}
                  </span>
                  <span className="file-name">{share.fileName}</span>
                </div>
                <div className="share-partner">
                  <strong>共有先:</strong> {share.partnerName}
                </div>
                <div className="share-meta">
                  <span>共有日: {formatDate(share.sharedAt)}</span>
                  {share.expiresAt && (
                    <span> • 有効期限: {formatDate(share.expiresAt)}</span>
                  )}
                  {share.downloadLimit ? (
                    <span>
                      {' '}
                      • ダウンロード: {share.currentDownloadCount}/
                      {share.downloadLimit}
                    </span>
                  ) : (
                    <span> • ダウンロード: {share.currentDownloadCount}回</span>
                  )}
                </div>
                {share.message && (
                  <div className="share-message">
                    <strong>メッセージ:</strong> {share.message}
                  </div>
                )}
              </div>
              <div className="share-status">
                {getStatusBadge(share.status)}
                {share.status === 'ACTIVE' && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRevoke(share.id)}
                    disabled={loading}
                  >
                    無効化
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 共有作成モーダル */}
      {showShareModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ファイル共有</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>共有するファイル *</label>
                <select
                  name="fileId"
                  value={formData.fileId}
                  onChange={handleChange}
                  required
                >
                  <option value="">選択してください</option>
                  {files.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.fileName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>共有対象 *</label>
                <select
                  name="shareTarget"
                  value={formData.shareTarget}
                  onChange={handleShareTargetChange}
                  required
                >
                  <option value="SPECIFIC_PARTNER">特定のパートナー</option>
                  <option value="ALL_PARTNERS">全パートナー</option>
                </select>
              </div>

              {formData.shareTarget === 'SPECIFIC_PARTNER' && (
                <div className="form-group">
                  <label>共有先パートナー *</label>
                  <select
                    name="partnerId"
                    value={formData.partnerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">選択してください</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>共有方法 *</label>
                <select
                  name="shareMethod"
                  value={formData.shareMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="SYSTEM_LINK">システム内リンク</option>
                  <option value="EMAIL_LINK">メールでリンク送付</option>
                  <option value="EMAIL_ATTACH">メールで添付</option>
                </select>
              </div>

              <div className="form-group">
                <label>有効期限</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                <small>未設定の場合は無期限</small>
              </div>

              <div className="form-group">
                <label>ダウンロード回数制限</label>
                <input
                  type="number"
                  name="downloadLimit"
                  value={formData.downloadLimit}
                  onChange={handleChange}
                  min="1"
                  placeholder="未設定の場合は無制限"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifyOnDownload"
                    checked={formData.notifyOnDownload}
                    onChange={handleChange}
                  />
                  ダウンロード時に通知を受け取る
                </label>
              </div>

              <div className="form-group">
                <label>メッセージ</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="パートナーへのメッセージを入力してください"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '作成中...' : '共有する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentShares;