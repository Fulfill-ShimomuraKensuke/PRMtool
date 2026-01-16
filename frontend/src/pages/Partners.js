import React, { useState, useEffect } from 'react';
import partnerService from '../services/partnerService';
import './Partners.css';

// パートナー管理ページコンポーネント
const Partners = () => {
  const [partners, setPartners] = useState([]); // 全パートナー一覧
  const [filteredPartners, setFilteredPartners] = useState([]); // 検索フィルター後のパートナー一覧
  const [loading, setLoading] = useState(true); // ローディング状態
  const [error, setError] = useState(''); // エラーメッセージ表示用state
  const [showEditModal, setShowEditModal] = useState(false); // 編集モーダル表示用state
  const [showDetailModal, setShowDetailModal] = useState(false); // 詳細モーダル表示用state
  const [editingPartner, setEditingPartner] = useState(null); // 編集中のパートナー情報
  const [selectedPartner, setSelectedPartner] = useState(null); // 詳細表示中のパートナー情報
  // フォームデータ用のstate
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    phone: '',
    address: '',
    contacts: [{ contactName: '', contactInfo: '' }]
  });

  // 検索フィルター用のstate
  const [searchTerm, setSearchTerm] = useState('');

  // CSVインポート用のstate
  const [showImportModal, setShowImportModal] = useState(false); // インポートモーダル表示用state
  const [selectedFile, setSelectedFile] = useState(null); // 選択中のCSVファイル
  const [importing, setImporting] = useState(false); // インポート中状態
  const [importResult, setImportResult] = useState(null); // インポート結果表示用state

  // 初回レンダリング時にパートナー一覧を取得
  useEffect(() => {
    document.title = 'パートナー管理 - PRM Tool';
    fetchPartners();
  }, []);

  // 検索フィルター処理
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPartners(partners);
    } else {
      const filtered = partners.filter(partner => {
        const searchLower = searchTerm.toLowerCase();
        // パートナー名で検索
        const nameMatch = partner.name.toLowerCase().includes(searchLower);
        // 担当者名で検索
        const contactMatch = partner.contacts.some(contact =>
          contact.contactName.toLowerCase().includes(searchLower) ||
          contact.contactInfo.toLowerCase().includes(searchLower)
        );
        return nameMatch || contactMatch;
      });
      setFilteredPartners(filtered);
    }
  }, [searchTerm, partners]);

  // パートナー一覧取得関数
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getAll();
      setPartners(data);
      setFilteredPartners(data);
      setError('');
    } catch (err) {
      setError('パートナー一覧の取得に失敗しました');
      console.error('Fetch partners error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 新規作成モーダルを開く
  const handleOpenCreateModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      industry: '',
      phone: '',
      address: '',
      contacts: [{ contactName: '', contactInfo: '' }]
    });
    setShowEditModal(true);
  };

  // 編集モーダルを開く
  const handleOpenEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      industry: partner.industry || '',
      phone: partner.phone || '',
      address: partner.address || '',
      contacts: partner.contacts.length > 0
        ? partner.contacts.map(c => ({ contactName: c.contactName, contactInfo: c.contactInfo }))
        : [{ contactName: '', contactInfo: '' }]
    });
    setShowEditModal(true);
  };

  // 編集モーダルを閉じる
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPartner(null);
    setError('');
  };

  // 詳細モーダルを開く
  const handleOpenDetailModal = (partner) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  // 詳細モーダルを閉じる
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPartner(null);
  };

  // 担当者追加・削除・変更処理
  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { contactName: '', contactInfo: '' }]
    });
  };

  // 担当者削除
  const removeContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      contacts: newContacts.length > 0 ? newContacts : [{ contactName: '', contactInfo: '' }]
    });
  };

  // 担当者情報変更
  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.contacts];
    newContacts[index][field] = value;
    setFormData({
      ...formData,
      contacts: newContacts
    });
  };

  // フォーム送信処理（新規作成・編集共通）
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validContacts = formData.contacts.filter(
      c => c.contactName.trim() && c.contactInfo.trim()
    );

    if (validContacts.length === 0) {
      setError('最低1人の担当者（名前と連絡先）を入力してください');
      return;
    }

    try {
      const payload = {
        ...formData,
        contacts: validContacts
      };

      if (editingPartner) {
        await partnerService.update(editingPartner.id, payload);
      } else {
        await partnerService.create(payload);
      }
      fetchPartners();
      handleCloseEditModal();
    } catch (err) {
      setError('パートナーの保存に失敗しました');
      console.error('Save partner error:', err);
    }
  };

  // パートナー削除処理
  const handleDelete = async (id) => {
    if (window.confirm('このパートナーを削除してもよろしいですか？')) {
      try {
        await partnerService.delete(id);
        handleCloseDetailModal();
        fetchPartners();
      } catch (err) {
        setError('パートナーの削除に失敗しました');
        console.error('Delete partner error:', err);
      }
    }
  };

  // 担当者数の表示レンダリング
  const renderContactsCount = (contacts) => {
    if (!contacts || contacts.length === 0) {
      return <span>登録なし</span>;
    }
    return <span>{contacts.length}名</span>;
  };

  // 検索クリア
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // インポートモーダルを開く
  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setSelectedFile(null);
    setImportResult(null);
    setError('');
  };

  // インポートモーダルを閉じる
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportResult(null);
    setError('');
  };

  // ファイル選択
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('CSVファイルを選択してください');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setError('');
      }
    }
  };

  // CSVインポート実行
  const handleImportCsv = async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    try {
      setImporting(true);
      const result = await partnerService.importCsv(selectedFile);
      setImportResult(result);

      if (result.successCount > 0) {
        await fetchPartners();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'インポートに失敗しました');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  // CSVエクスポート実行
  const handleExportCsv = () => {
    // ヘッダー行を作成
    const headers = ['パートナー名', '業種', '代表電話', '住所', '担当者名', '担当者連絡先'];

    // データ行を作成（1行に全ての担当者をカンマ区切りで）
    const rows = partners.map(partner => {
      // 担当者名をカンマ区切りで結合
      const contactNames = partner.contacts && partner.contacts.length > 0
        ? partner.contacts.map(c => c.contactName).join(',')
        : '';

      // 担当者連絡先をカンマ区切りで結合
      const contactInfos = partner.contacts && partner.contacts.length > 0
        ? partner.contacts.map(c => c.contactInfo).join(',')
        : '';

      return [
        partner.name,
        partner.industry || '',
        partner.phone || '',
        partner.address || '',
        contactNames,
        contactInfos
      ];
    });

    // CSV文字列を作成
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          // セル内にカンマや改行がある場合はダブルクォートで囲む
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // UTF-8 BOMを追加（Excel対応）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // ダウンロード用のリンクを作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // ファイル名を生成（日付付き）
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `partners_${date}.csv`);

    // ダウンロードを実行
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URLを解放
    URL.revokeObjectURL(url);
  };

  // CSVテンプレートダウンロード
  const handleDownloadTemplate = () => {
    // テンプレートヘッダーを作成
    const headers = ['パートナー名', '業種', '代表電話', '住所', '担当者名', '担当者連絡先'];

    // サンプルデータを作成（3行）
    const sampleData = [
      ['サンプル企業A', 'IT・通信', '03-1234-5678', '東京都渋谷区', '山田太郎,佐藤花子', 'yamada@example.com,sato@example.com'],
      ['サンプル企業B', '製造業', '03-2345-6789', '大阪府大阪市', '田中次郎', 'tanaka@example.com'],
      ['サンプル企業C', '金融・保険', '03-3456-7890', '福岡県福岡市', '鈴木一郎,高橋美咲,伊藤健太', 'suzuki@example.com,takahashi@example.com,ito@example.com']
    ];

    // CSV文字列を作成
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row =>
        row.map(cell => {
          // セル内にカンマがある場合はダブルクォートで囲む
          if (cell.includes(',')) {
            return `"${cell}"`;
          }
          return cell;
        }).join(',')
      )
    ].join('\n');

    // UTF-8 BOMを追加（Excel対応）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // ダウンロード用のリンクを作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'partners_template.csv');

    // ダウンロードを実行
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URLを解放
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="partners-container">
        <div className="partners-header">
          <h1>パートナー管理</h1>
          <div className="header-buttons">
            <button onClick={handleDownloadTemplate} className="btn-template">
              CSVテンプレート
            </button>
            <button onClick={handleOpenImportModal} className="btn-secondary">
              CSVインポート
            </button>
            <button onClick={handleExportCsv} className="btn-export">
              CSVエクスポート
            </button>
            <button onClick={handleOpenCreateModal} className="btn-primary">
              新規パートナー
            </button>
          </div>
        </div>

        {/* 検索バー */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="パートナー名または担当者名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={handleClearSearch} className="btn-clear">
              クリア
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <>
            {/* 検索結果の件数表示 */}
            {searchTerm && (
              <div className="search-results-info">
                {filteredPartners.length}件のパートナーが見つかりました
              </div>
            )}

            <div className="partners-grid">
              {filteredPartners.length === 0 ? (
                <p className="no-data">
                  {searchTerm ? '検索条件に一致するパートナーがありません' : 'パートナーがありません'}
                </p>
              ) : (
                filteredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="partner-card"
                    onDoubleClick={() => handleOpenDetailModal(partner)}
                  >
                    <h3>{partner.name}</h3>
                    <p><strong>業種:</strong> {partner.industry || '登録なし'}</p>
                    <p><strong>代表電話:</strong> {partner.phone || '登録なし'}</p>
                    <p><strong>住所:</strong> {partner.address || '登録なし'}</p>
                    <p><strong>担当者:</strong> {renderContactsCount(partner.contacts)}</p>
                    <button
                      onClick={() => handleOpenDetailModal(partner)}
                      className="btn-detail"
                    >
                      詳細
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* 詳細モーダル */}
        {showDetailModal && selectedPartner && (
          <div className="modal-overlay">
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedPartner.name}</h2>
                <button onClick={handleCloseDetailModal} className="btn-close">×</button>
              </div>

              <div className="partner-detail-content">
                <div className="detail-section">
                  <h3>基本情報</h3>
                  <p><strong>業種:</strong> {selectedPartner.industry || '登録なし'}</p>
                  <p><strong>代表電話:</strong> {selectedPartner.phone || '登録なし'}</p>
                  <p><strong>住所:</strong> {selectedPartner.address || '登録なし'}</p>
                </div>

                <div className="detail-section">
                  <h3>担当者一覧</h3>
                  {selectedPartner.contacts && selectedPartner.contacts.length > 0 ? (
                    <table className="contacts-table">
                      <thead>
                        <tr>
                          <th>氏名</th>
                          <th>連絡先</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPartner.contacts.map((contact, index) => (
                          <tr key={index}>
                            <td>{contact.contactName}</td>
                            <td>{contact.contactInfo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>担当者が登録されていません</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => handleOpenEditModal(selectedPartner)} className="btn-edit">
                  編集
                </button>
                <button onClick={() => handleDelete(selectedPartner.id)} className="btn-delete">
                  削除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 編集モーダル */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingPartner ? 'パートナー編集' : '新規パートナー'}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>企業名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>業種</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>代表電話</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>住所</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>担当者 *</label>
                  <div className="contacts-list">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="contact-item">
                        <input
                          type="text"
                          placeholder="担当者名"
                          value={contact.contactName}
                          onChange={(e) => handleContactChange(index, 'contactName', e.target.value)}
                          className="form-input contact-name-input"
                        />
                        <input
                          type="text"
                          placeholder="連絡先（電話/メール）"
                          value={contact.contactInfo}
                          onChange={(e) => handleContactChange(index, 'contactInfo', e.target.value)}
                          className="form-input contact-info-input"
                        />
                        {formData.contacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="btn-delete-modal"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addContact} className="btn-add-contact">
                    + 担当者を追加
                  </button>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={handleCloseEditModal} className="btn-cancel">
                    キャンセル
                  </button>
                  <button type="submit" className="btn-submit">
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CSVインポートモーダル */}
        {showImportModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>パートナーCSVインポート</h2>
              </div>

              {error && <div className="error-message">{error}</div>}

              {!importResult ? (
                <>
                  <div className="import-instructions">
                    <h3>CSVファイル形式</h3>
                    <p>以下の形式でCSVファイルを作成してください：</p>
                    <pre className="csv-format">
                      パートナー名,業種,代表電話,住所,担当者名,担当者連絡先
                      サンプル企業A,IT・通信,03-1234-5678,東京都渋谷区,"山田太郎,佐藤花子","yamada@example.com,sato@example.com"
                      サンプル企業B,製造業,03-2345-6789,大阪府大阪市,田中次郎,tanaka@example.com
                    </pre>
                    <ul className="csv-notes">
                      <li>1行目はヘッダー行（列名）です</li>
                      <li>パートナー名と最低1人の担当者（名前・連絡先）は必須です</li>
                      <li>複数の担当者はカンマ区切りで1セルに入力してください</li>
                      <li>担当者名と担当者連絡先の数は一致させる必要があります</li>
                      <li>業種、代表電話、住所は省略可能です</li>
                    </ul>
                  </div>

                  <div className="file-upload">
                    <label htmlFor="csv-file" className="file-label">
                      CSVファイルを選択
                    </label>
                    <input
                      type="file"
                      id="csv-file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    {selectedFile && (
                      <p className="file-name">選択中: {selectedFile.name}</p>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={handleCloseImportModal}
                      className="btn-cancel"
                      disabled={importing}
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={handleImportCsv}
                      className="btn-submit"
                      disabled={!selectedFile || importing}
                    >
                      {importing ? 'インポート中...' : 'インポート'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="import-result">
                    <h3>インポート結果</h3>
                    <div className="result-summary">
                      <p className="success-count">
                        ✅ 成功: {importResult.successCount}件
                      </p>
                      <p className="error-count">
                        ❌ エラー: {importResult.errorCount}件
                      </p>
                    </div>

                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="error-details">
                        <h4>エラー詳細:</h4>
                        <ul>
                          {importResult.errors.map((err, index) => (
                            <li key={index}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={handleCloseImportModal}
                      className="btn-submit"
                    >
                      閉じる
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Partners;