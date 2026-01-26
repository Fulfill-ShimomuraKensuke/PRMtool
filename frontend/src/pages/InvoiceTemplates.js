import { useState, useEffect, useCallback } from 'react';
import invoiceTemplateService from '../services/invoiceTemplateService';
import { useAuth } from '../context/AuthContext';
import './InvoiceTemplates.css';

/**
 * 請求書テンプレート管理ページ
 * テンプレートの作成、編集、削除、プレビュー機能を提供
 */
const InvoiceTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    logoUrl: '',
    primaryColor: '#2c3e50',
    secondaryColor: '#3498db',
    fontFamily: 'Arial',
    layoutSettings: '{}',
    headerText: '',
    footerText: '',
    bankInfo: '',
    paymentTerms: '',
    notes: '',
    isDefault: false,
  });

  useEffect(() => {
    document.title = '請求書テンプレート管理 - PRM Tool';
    fetchTemplates();
  }, []);

  // プレビューを閉じる（useCallbackでラップして最適化）
  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
  }, [previewPdfUrl]);

  // プレビュー表示時にESCキーで閉じる
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && showPreviewModal) {
        handleClosePreview();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showPreviewModal, handleClosePreview]);

  // テンプレート一覧を取得
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await invoiceTemplateService.getAll();
      setTemplates(data);
    } catch (err) {
      setError('テンプレートの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // モーダルを開く（新規作成または編集）
  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        templateName: template.templateName,
        description: template.description || '',
        companyName: template.companyName || '',
        companyAddress: template.companyAddress || '',
        companyPhone: template.companyPhone || '',
        companyEmail: template.companyEmail || '',
        companyWebsite: template.companyWebsite || '',
        logoUrl: template.logoUrl || '',
        primaryColor: template.primaryColor || '#2c3e50',
        secondaryColor: template.secondaryColor || '#3498db',
        fontFamily: template.fontFamily || 'Arial',
        layoutSettings: template.layoutSettings || '{}',
        headerText: template.headerText || '',
        footerText: template.footerText || '',
        bankInfo: template.bankInfo || '',
        paymentTerms: template.paymentTerms || '',
        notes: template.notes || '',
        isDefault: template.isDefault || false,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        templateName: '',
        description: '',
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        companyWebsite: '',
        logoUrl: '',
        primaryColor: '#2c3e50',
        secondaryColor: '#3498db',
        fontFamily: 'Arial',
        layoutSettings: '{}',
        headerText: '',
        footerText: '',
        bankInfo: '',
        paymentTerms: '',
        notes: '',
        isDefault: false,
      });
    }
    setShowModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setError('');
  };

  // フォーム入力変更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // フォーム送信（作成または更新）
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingTemplate) {
        await invoiceTemplateService.update(editingTemplate.id, formData);
      } else {
        await invoiceTemplateService.create(formData);
      }
      await fetchTemplates();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'テンプレート操作に失敗しました');
    }
  };

  // テンプレート削除
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか?')) return;

    try {
      await invoiceTemplateService.delete(id);
      await fetchTemplates();
    } catch (err) {
      setError('テンプレートの削除に失敗しました');
      console.error(err);
    }
  };

  // デフォルトテンプレートに設定
  const handleSetDefault = async (id) => {
    try {
      await invoiceTemplateService.setDefault(id);
      await fetchTemplates();
    } catch (err) {
      setError('デフォルト設定に失敗しました');
      console.error(err);
    }
  };

  // プレビューを表示
  const handlePreview = async (id) => {
    try {
      const pdfBlob = await invoiceTemplateService.getPreviewPdf(id);
      const url = URL.createObjectURL(pdfBlob);
      setPreviewPdfUrl(url);
      setShowPreviewModal(true);
    } catch (err) {
      setError('プレビューの表示に失敗しました');
      console.error(err);
    }
  };

  // 管理者権限チェック
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <div className="invoice-templates-container">
        <div className="page-header">
          <h1>📋 請求書テンプレート管理</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + 新規テンプレート作成
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <p>テンプレートがまだありません。新規作成してください。</p>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h3>{template.templateName}</h3>
                  {template.isDefault && (
                    <span className="badge-default">デフォルト</span>
                  )}
                </div>
                <p className="template-description">{template.description}</p>
                <div className="template-info">
                  <p>作成者: {template.createdByName}</p>
                  <p>
                    作成日: {new Date(template.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="template-actions">
                  <button
                    onClick={() => handleOpenModal(template)}
                    className="btn btn-primary btn-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handlePreview(template.id)}
                    className="btn btn-info btn-sm"
                  >
                    プレビュー
                  </button>
                  {!template.isDefault && isAdmin && (
                    <button
                      onClick={() => handleSetDefault(template.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      デフォルトに設定
                    </button>
                  )}
                  {!template.isDefault && isAdmin && (
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="btn btn-danger btn-sm"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 作成・編集モーダル */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'テンプレート編集' : '新規テンプレート作成'}</h2>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>基本情報</h3>
                <div className="form-group">
                  <label>
                    テンプレート名 *
                  </label>
                  <input
                    type="text"
                    name="templateName"
                    value={formData.templateName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>説明</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>会社情報</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>会社名</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>電話番号</label>
                    <input
                      type="text"
                      name="companyPhone"
                      value={formData.companyPhone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>メールアドレス</label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>ウェブサイト</label>
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>住所</label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>ロゴURL</label>
                  <input
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>デザイン設定</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>プライマリカラー</label>
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>セカンダリカラー</label>
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>フォント</label>
                    <select
                      name="fontFamily"
                      value={formData.fontFamily}
                      onChange={handleChange}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>フッター設定</h3>
                <div className="form-group">
                  <label>振込先情報</label>
                  <textarea
                    name="bankInfo"
                    value={formData.bankInfo}
                    onChange={handleChange}
                    rows="3"
                    placeholder="銀行名、支店名、口座番号など"
                  />
                </div>

                <div className="form-group">
                  <label>支払条件</label>
                  <textarea
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    rows="2"
                    placeholder="例: 発行日より30日以内にお振込みください"
                  />
                </div>

                <div className="form-group">
                  <label>フッターテキスト</label>
                  <textarea
                    name="footerText"
                    value={formData.footerText}
                    onChange={handleChange}
                    rows="2"
                    placeholder="その他の備考やメッセージ"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTemplate ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* プレビューモーダル - フルスクリーン版 */}
      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-content preview-modal">
            <div className="modal-header">
              <h2>テンプレートプレビュー</h2>
              <button 
                onClick={handleClosePreview} 
                className="close-button"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="preview-container">
              {previewPdfUrl && (
                <iframe
                  src={previewPdfUrl}
                  className="pdf-preview"
                  title="Invoice Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceTemplates;