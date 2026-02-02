import React, { useState, useEffect } from 'react';
import './ContentShares.css';

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
    partnerId: '',
    expiresAt: '',
    downloadLimit: '',
    message: ''
  });

  // エラーメッセージ
  const [error, setError] = useState('');

  // 初期データ取得
  useEffect(() => {
    fetchShares();
    fetchPartners();
    fetchFiles();
  }, []);

  // 共有一覧を取得
  const fetchShares = async () => {
    // TODO: APIから取得
    // 仮データ
    setShares([
      {
        id: '1',
        fileName: '製品Aカタログ_v2.pdf',
        partnerName: '株式会社サンプル',
        sharedAt: '2026-02-01',
        expiresAt: '2026-03-01',
        downloadCount: 3,
        downloadLimit: 10,
        status: 'ACTIVE'
      },
      {
        id: '2',
        fileName: '提案書テンプレート.pptx',
        partnerName: '株式会社テスト',
        sharedAt: '2026-01-28',
        expiresAt: '2026-02-28',
        downloadCount: 1,
        downloadLimit: 5,
        status: 'ACTIVE'
      },
      {
        id: '3',
        fileName: '操作マニュアル_v3.pdf',
        partnerName: '全パートナー',
        sharedAt: '2026-01-25',
        expiresAt: null,
        downloadCount: 15,
        downloadLimit: null,
        status: 'ACTIVE'
      }
    ]);
  };

  // パートナー一覧を取得
  const fetchPartners = async () => {
    // TODO: APIから取得
    // 仮データ
    setPartners([
      { id: '1', name: '株式会社サンプル' },
      { id: '2', name: '株式会社テスト' },
      { id: '3', name: '株式会社デモ' }
    ]);
  };

  // ファイル一覧を取得
  const fetchFiles = async () => {
    // TODO: APIから取得
    // 仮データ
    setFiles([
      { id: '1', name: '製品Aカタログ_v2.pdf' },
      { id: '2', name: '提案書テンプレート.pptx' },
      { id: '3', name: '操作マニュアル_v3.pdf' }
    ]);
  };

  // 共有モーダルを開く
  const handleOpenShareModal = () => {
    setFormData({
      fileId: '',
      partnerId: '',
      expiresAt: '',
      downloadLimit: '',
      message: ''
    });
    setShowShareModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowShareModal(false);
    setError('');
  };

  // フォーム入力変更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 共有を作成
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: 共有作成API呼び出し
      console.log('共有作成:', formData);
      await fetchShares();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || '共有の作成に失敗しました');
    }
  };

  // 共有を無効化
  const handleRevoke = async (shareId) => {
    if (!window.confirm('この共有を無効化しますか？')) return;

    try {
      // TODO: 無効化API呼び出し
      console.log('無効化:', shareId);
      await fetchShares();
    } catch (err) {
      setError(err.response?.data?.message || '無効化に失敗しました');
    }
  };

  // ステータスのバッジを表示
  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: <span className="badge badge-success">有効</span>,
      EXPIRED: <span className="badge badge-warning">期限切れ</span>,
      REVOKED: <span className="badge badge-danger">無効化</span>,
      EXHAUSTED: <span className="badge badge-secondary">上限到達</span>
    };
    return badges[status] || status;
  };

  return (
    <div className="content-shares-container">
      <div className="shares-header">
        <h1>共有管理</h1>
        <button className="btn btn-primary" onClick={handleOpenShareModal}>
          + 新規共有
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* 共有一覧 */}
      <div className="shares-list">
        {shares.map((share) => (
          <div key={share.id} className="share-card">
            <div className="share-info">
              <div className="share-file">
                <span className="file-icon">📄</span>
                <span className="file-name">{share.fileName}</span>
              </div>
              <div className="share-partner">
                <strong>共有先:</strong> {share.partnerName}
              </div>
              <div className="share-meta">
                <span>共有日: {share.sharedAt}</span>
                {share.expiresAt && <span> • 有効期限: {share.expiresAt}</span>}
                {share.downloadLimit && (
                  <span> • ダウンロード: {share.downloadCount}/{share.downloadLimit}</span>
                )}
                {!share.downloadLimit && (
                  <span> • ダウンロード: {share.downloadCount}回</span>
                )}
              </div>
            </div>
            <div className="share-status">
              {getStatusBadge(share.status)}
              {share.status === 'ACTIVE' && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRevoke(share.id)}
                >
                  無効化
                </button>
              )}
            </div>
          </div>
        ))}
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
                      {file.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>共有先パートナー *</label>
                <select
                  name="partnerId"
                  value={formData.partnerId}
                  onChange={handleChange}
                  required
                >
                  <option value="">選択してください</option>
                  <option value="all">全パートナー</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>有効期限</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
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
                <button type="submit" className="btn btn-primary">
                  共有する
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