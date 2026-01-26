import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import invoiceTemplateService from '../services/invoiceTemplateService';
import './InvoiceTemplates.css';

/**
 * InvoiceTemplatesページ
 * テンプレートの一覧表示、作成、編集、削除を管理
 */
const InvoiceTemplates = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // 状態管理
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    logoUrl: '',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    fontFamily: 'Arial',
    footerText: '',
    bankInfo: '',
    paymentTerms: '',
    isDefault: false
  });

  /**
   * 初回レンダリング時にテンプレート一覧を取得
   */
  useEffect(() => {
    document.title = '請求書テンプレート管理 - PRM Tool';
    fetchTemplates();
  }, []);

  /**
   * テンプレート一覧を取得
   */
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await invoiceTemplateService.getAll();
      setTemplates(data);
      setError('');
    } catch (err) {
      setError('テンプレートの取得に失敗しました');
      console.error('Fetch templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * モーダルを開く
   * 新規作成または編集モードで開く
   */
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
        primaryColor: template.primaryColor || '#000000',
        secondaryColor: template.secondaryColor || '#666666',
        fontFamily: template.fontFamily || 'Arial',
        footerText: template.footerText || '',
        bankInfo: template.bankInfo || '',
        paymentTerms: template.paymentTerms || '',
        isDefault: template.isDefault || false
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
        primaryColor: '#000000',
        secondaryColor: '#666666',
        fontFamily: 'Arial',
        footerText: '',
        bankInfo: '',
        paymentTerms: '',
        isDefault: false
      });
    }
    setShowModal(true);
  };

  /**
   * モーダルを閉じる
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  /**
   * フォーム送信処理
   * テンプレートの作成または更新を実行
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingTemplate) {
        await invoiceTemplateService.update(editingTemplate.id, formData);
      } else {
        await invoiceTemplateService.create(formData);
      }
      handleCloseModal();
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'テンプレートの保存に失敗しました');
      console.error('Save template error:', err);
    }
  };

  /**
   * テンプレート削除処理
   */
  const handleDelete = async (id, templateName) => {
    if (window.confirm(`テンプレート「${templateName}」を削除してもよろしいですか？`)) {
      try {
        await invoiceTemplateService.delete(id);
        fetchTemplates();
      } catch (err) {
        setError(err.response?.data?.message || 'テンプレートの削除に失敗しました');
        console.error('Delete template error:', err);
      }
    }
  };

  /**
   * デフォルトテンプレートに設定
   */
  const handleSetDefault = async (id, templateName) => {
    if (window.confirm(`テンプレート「${templateName}」をデフォルトに設定しますか？`)) {
      try {
        await invoiceTemplateService.setAsDefault(id);
        fetchTemplates();
      } catch (err) {
        setError(err.response?.data?.message || 'デフォルト設定に失敗しました');
        console.error('Set default error:', err);
      }
    }
  };

  /**
   * プレビューPDFを表示
   * テンプレートのデザインをサンプルデータで確認
   */
  const handlePreview = async (id) => {
    try {
      setError('');
      const pdfBlob = await invoiceTemplateService.getPreviewPdf(id);
      const url = URL.createObjectURL(pdfBlob);
      setPreviewPdfUrl(url);
      setShowPreviewModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'プレビューの生成に失敗しました');
      console.error('Preview error:', err);
    }
  };

  /**
   * プレビューモーダルを閉じる
   * URLオブジェクトをクリーンアップ
   */
  const handleClosePreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
    setShowPreviewModal(false);
  };

  /**
   * 入力フィールドの変更処理
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="invoice-templates-container">
      <div className="page-header">
        <h1>請求書テンプレート管理</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          新規テンプレート作成
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h3>{template.templateName}</h3>
              {template.isDefault && <span className="badge-default">デフォルト</span>}
            </div>

            <div className="template-info">
              <p className="template-description">{template.description}</p>
              <div className="template-meta">
                <span>作成者: {template.createdByName}</span>
                <span>作成日: {new Date(template.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="template-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(template)}>
                編集
              </button>
              <button className="btn btn-sm btn-info" onClick={() => handlePreview(template.id)}>
                プレビュー
              </button>
              {!template.isDefault && isAdmin && (
                <>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleSetDefault(template.id, template.templateName)}
                  >
                    デフォルトに設定
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(template.id, template.templateName)}
                  >
                    削除
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="empty-state">
          <p>テンプレートがありません</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            最初のテンプレートを作成
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'テンプレート編集' : '新規テンプレート作成'}</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>基本情報</h3>
                <div className="form-group">
                  <label>テンプレート名 *</label>
                  <input
                    type="text"
                    name="templateName"
                    value={formData.templateName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>説明</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>会社情報</h3>
                <div className="form-group">
                  <label>会社名</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>住所</label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>電話番号</label>
                    <input
                      type="tel"
                      name="companyPhone"
                      value={formData.companyPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>メールアドレス</label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>ウェブサイト</label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>ロゴURL</label>
                  <input
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>セカンダリカラー</label>
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>フォント</label>
                    <select
                      name="fontFamily"
                      value={formData.fontFamily}
                      onChange={handleInputChange}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>フッター情報</h3>
                <div className="form-group">
                  <label>フッターテキスト</label>
                  <textarea
                    name="footerText"
                    value={formData.footerText}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>振込先情報</label>
                  <textarea
                    name="bankInfo"
                    value={formData.bankInfo}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>支払条件</label>
                  <textarea
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  デフォルトテンプレートに設定
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
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

      {showPreviewModal && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>テンプレートプレビュー</h2>
              <button className="close-button" onClick={handleClosePreview}>×</button>
            </div>

            <div className="preview-container">
              {previewPdfUrl && (
                <iframe
                  src={previewPdfUrl}
                  title="PDF Preview"
                  className="pdf-preview"
                />
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClosePreview}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTemplates;