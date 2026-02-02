import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import partnerService from '../services/partnerService';
import { searchAddressByPostalCode } from '../utils/postalCodeUtil';
import {
  validatePartnerForm,
  formatPhoneInput,
  formatPostalCodeInput
} from '../utils/partnerValidation';
import './Partners.css';

/**
 * パートナー管理画面
 * パートナー企業の一覧表示、作成、編集、削除機能
 */
const Partners = () => {
  const navigate = useNavigate(); // ナビゲーション用フック

  // state定義
  const [partners, setPartners] = useState([]); // 全パートナー一覧
  const [filteredPartners, setFilteredPartners] = useState([]); // 検索フィルター後のパートナー一覧
  const [loading, setLoading] = useState(false); // ローディング状態
  const [error, setError] = useState(''); // エラーメッセージ表示用state
  const [searchTerm, setSearchTerm] = useState('');

  // モーダル状態
  const [showEditModal, setShowEditModal] = useState(false); // 編集モーダル表示用state
  const [showDetailModal, setShowDetailModal] = useState(false); // 詳細モーダル表示用state
  const [editingPartner, setEditingPartner] = useState(null); // 編集中のパートナー情報
  const [selectedPartner, setSelectedPartner] = useState(null); // 詳細表示中のパートナー情報
  // フォームデータ
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    phone: '',
    postalCode: '',
    address: '',
    email: '',
    contacts: [{ contactName: '', phone: '', email: '' }]
  });

  // バリデーションエラー
  const [errors, setErrors] = useState({});

  // 郵便番号検索中フラグ
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // CSVインポート用のstate
  const [showImportModal, setShowImportModal] = useState(false); // インポートモーダル表示用state
  const [selectedFile, setSelectedFile] = useState(null); // 選択中のCSVファイル
  const [importing, setImporting] = useState(false); // インポート中状態
  const [importResult, setImportResult] = useState(null); // インポート結果表示用state

  // 初回読み込み
  useEffect(() => {
    document.title = 'パートナー管理 - PRM Tool';
    fetchPartners();
  }, []);

  // 検索フィルタリング
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredPartners(partners);
    } else {
      const filtered = partners.filter(partner => {
        // パートナー名で検索
        const nameMatch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
        // 担当者名で検索
        const contactMatch = partner.contacts.some(c =>
          c.contactName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return nameMatch || contactMatch;
      });
      setFilteredPartners(filtered);
    }
  }, [searchTerm, partners]);

  // パートナー一覧取得
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
      postalCode: '',
      address: '',
      email: '',
      contacts: [{ contactName: '', phone: '', email: '' }]
    });
    setErrors({});
    setShowEditModal(true);
  };

  // 編集モーダルを開く（詳細モーダルを閉じてから開く）
  const handleOpenEditModal = (partner) => {
    setShowDetailModal(false);
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      industry: partner.industry || '',
      phone: partner.phone || '',
      postalCode: partner.postalCode || '',
      address: partner.address || '',
      email: partner.email || '',
      contacts: partner.contacts.length > 0
        ? partner.contacts.map(c => ({
          contactName: c.contactName,
          phone: c.phone || '',
          email: c.email || ''
        }))
        : [{ contactName: '', phone: '', email: '' }]
    });
    setErrors({});
    setShowEditModal(true);
  };

  // モーダルを閉じる（編集中の場合は詳細モーダルを再表示）
  const handleCloseEditModal = () => {
    const partnerToShow = editingPartner;
    setShowEditModal(false);
    setEditingPartner(null);
    setErrors({});
    // 編集中のパートナーがあった場合は詳細モーダルを再表示
    if (partnerToShow) {
      setSelectedPartner(partnerToShow);
      setShowDetailModal(true);
    }
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

  // フォーム項目の変更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // 電話番号の変更（自動フォーマット）
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  // 郵便番号の変更（自動フォーマット・住所自動補完）
  const handlePostalCodeChange = async (e) => {
    const formatted = formatPostalCodeInput(e.target.value);
    setFormData(prev => ({ ...prev, postalCode: formatted }));

    if (errors.postalCode) {
      setErrors(prev => ({ ...prev, postalCode: undefined }));
    }

    // 7桁入力されたら住所を自動検索
    if (formatted.length === 7) {
      setIsSearchingAddress(true);
      try {
        const addressData = await searchAddressByPostalCode(formatted);
        if (addressData) {
          setFormData(prev => ({ ...prev, address: addressData.fullAddress }));
        }
      } catch (error) {
        console.error('住所検索エラー:', error);
      } finally {
        setIsSearchingAddress(false);
      }
    }
  };

  // 担当者情報の変更
  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.contacts];

    // 電話番号の場合はフォーマット
    if (field === 'phone') {
      value = formatPhoneInput(value);
    }

    newContacts[index][field] = value;
    setFormData(prev => ({ ...prev, contacts: newContacts }));

    // エラーをクリア
    const errorKey = `contact_${index}_${field}`;
    const errorInfoKey = `contact_${index}_info`;
    if (errors[errorKey] || errors[errorInfoKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: undefined,
        [errorInfoKey]: undefined
      }));
    }
  };

  // 担当者を追加
  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { contactName: '', phone: '', email: '' }]
    }));
  };

  // 担当者を削除
  const removeContact = (index) => {
    if (formData.contacts.length === 1) {
      alert('担当者は最低1人必要です');
      return;
    }

    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  // 保存処理（保存後に詳細モーダルを再表示）
  const handleSave = async () => {
    // バリデーション
    const validationErrors = validatePartnerForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert('入力内容に誤りがあります。確認してください。');
      return;
    }

    try {
      let savedPartnerId;

      if (editingPartner) {
        await partnerService.update(editingPartner.id, formData);
        savedPartnerId = editingPartner.id;
        alert('パートナー情報を更新しました');
      } else {
        const result = await partnerService.create(formData);
        savedPartnerId = result.id;
        alert('パートナーを登録しました');
      }

      // 編集モーダルを閉じる
      setShowEditModal(false);
      setEditingPartner(null);
      setErrors({});

      // パートナー一覧を再取得
      await fetchPartners();

      // 保存したパートナーの最新情報を取得して詳細モーダルを表示
      try {
        const updatedPartner = await partnerService.getById(savedPartnerId);
        setSelectedPartner(updatedPartner);
        setShowDetailModal(true);
      } catch (err) {
        console.error('Failed to fetch updated partner:', err);
        // 詳細表示に失敗しても処理は続行
      }
    } catch (err) {
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('保存に失敗しました');
      }
      console.error('Save partner error:', err);
    }
  };

  // 削除処理
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) {
      return;
    }

    try {
      await partnerService.delete(id);
      alert('パートナーを削除しました');
      fetchPartners();
    } catch (err) {
      alert('削除に失敗しました');
      console.error('Delete partner error:', err);
    }
  };

  // ローディング表示
  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  // 検索クリア
  const handleClearSearch = () => {
    setSearchTerm('');
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

  return (
    <div className="partners-container">
      <div className="partners-header">
        <h1>🏢パートナー管理</h1>
        <div className="header-buttons">
          <button onClick={handleDownloadTemplate} className="btn-template">
            CSVテンプレート
          </button>
          <button onClick={handleOpenImportModal} className="btn-import">
            CSVインポート
          </button>
          <button onClick={handleExportCsv} className="btn-export">
            CSVエクスポート
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary">
            + 新規パートナー作成
          </button>
        </div>
      </div>

      {/* 検索バー */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="企業名または担当者名で検索..."
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

          {/* パートナー一覧 */}
          <div className="partners-grid">
            {filteredPartners.length === 0 ? (
              <p className="no-data">
                {searchTerm ? '検索条件に一致するパートナーがありません' : 'パートナーがありません'}
              </p>
            ) : (
              filteredPartners.map(partner => (
                <div
                  key={partner.id}
                  className="partner-card"
                  onDoubleClick={() => handleOpenDetailModal(partner)}
                >
                  <h3>{partner.name}</h3>
                  {partner.industry && <p>業界: {partner.industry}</p>}
                  {partner.phone && <p>電話: {partner.phone}</p>}
                  {partner.email && <p>メール: {partner.email}</p>}
                  <p>担当者: {partner.contacts.length}人</p>
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
            {error && <div className="error-message">{error}</div>}
            <div className="partner-detail-content">
              <div className="detail-section">
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th colSpan="2">企業情報</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="2">
                        <strong>業界:</strong> {selectedPartner.industry || '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>郵便番号:</strong> {selectedPartner.postalCode || '未設定'}
                      </td>
                      <td>
                        <strong>住所:</strong> {selectedPartner.address || '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>代表電話:</strong> {selectedPartner.phone || '未設定'}
                      </td>
                      <td>
                        <strong>メールアドレス:</strong> {selectedPartner.email || '未設定'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="detail-section">
                {selectedPartner.contacts && selectedPartner.contacts.length > 0 ? (
                  <table className="contacts-table">
                    <thead>
                      <tr>
                        <th colSpan="2">担当者情報</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPartner.contacts.map((contact, index) => (
                        <React.Fragment key={index}>
                          <tr className="contact-name-row">
                            <td colSpan="2">
                              <strong>担当者名:</strong> {contact.contactName}
                            </td>
                          </tr>
                          <tr className="contact-info-row">
                            <td>
                              <strong>電話番号:</strong> {contact.phone || '未設定'}
                            </td>
                            <td>
                              <strong>メールアドレス:</strong> {contact.email || '未設定'}
                            </td>
                          </tr>
                          {index < selectedPartner.contacts.length - 1 && (
                            <tr className="contact-separator">
                              <td colSpan="2" style={{ padding: '0.5rem 0', borderBottom: '2px solid #dee2e6' }}></td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>担当者が登録されていません</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => navigate(`/partners/${selectedPartner.id}/dashboard`)}
                className="btn-dashboard"
              >
                📊 ダッシュボードを見る
              </button>
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
            <h3>{editingPartner ? 'パートナー編集' : 'パートナー新規登録'}</h3>

            {/* 企業情報 */}
            <div className="form-section">
              <h4>企業情報</h4>

              <div className="form-group">
                <label className="required">企業名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>業界</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>郵便番号</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={handlePostalCodeChange}
                    placeholder="1234567"
                    maxLength="7"
                    className={errors.postalCode ? 'error' : ''}
                  />
                  {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
                  {isSearchingAddress && <span className="info-text">住所を検索中...</span>}
                </div>

                <div className="form-group">
                  <label>住所</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>代表電話</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="03-1234-5678"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label>メールアドレス</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            {/* 担当者情報 */}
            <div className="form-section">
              <h4>担当者情報</h4>

              {formData.contacts.map((contact, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-header">
                    <span>担当者 {index + 1}</span>
                    {formData.contacts.length > 1 && (
                      <button onClick={() => removeContact(index)} className="btn-remove-contact">削除</button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="required">担当者名</label>
                      <input
                        type="text"
                        value={contact.contactName}
                        onChange={(e) => handleContactChange(index, 'contactName', e.target.value)}
                        className={errors[`contact_${index}_name`] ? 'error' : ''}
                      />
                      {errors[`contact_${index}_name`] && (
                        <span className="error-text">{errors[`contact_${index}_name`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>電話番号</label>
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        placeholder="03-1234-5678"
                        className={errors[`contact_${index}_phone`] ? 'error' : ''}
                      />
                      {errors[`contact_${index}_phone`] && (
                        <span className="error-text">{errors[`contact_${index}_phone`]}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>メールアドレス</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                      className={errors[`contact_${index}_email`] ? 'error' : ''}
                    />
                    {errors[`contact_${index}_email`] && (
                      <span className="error-text">{errors[`contact_${index}_email`]}</span>
                    )}
                  </div>

                  {errors[`contact_${index}_info`] && (
                    <div className="error-text">{errors[`contact_${index}_info`]}</div>
                  )}
                </div>
              ))}

              <button onClick={addContact} className="btn-add-contact">
                + 担当者を追加
              </button>
            </div>

            {/* モーダルフッター */}
            <div className="modal-footer">
              <button onClick={handleCloseEditModal} className="btn-cancel">
                キャンセル
              </button>
              <button onClick={handleSave} className="btn-primary">
                保存
              </button>
            </div>
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
  );
};

export default Partners;