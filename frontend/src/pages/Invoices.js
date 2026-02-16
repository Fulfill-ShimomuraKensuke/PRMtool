import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import partnerService from '../services/partnerService';
import commissionRuleService from '../services/commissionRuleService';
import invoiceTemplateService from '../services/invoiceTemplateService';
import invoiceDeliveryService from '../services/invoiceDeliveryService';
import './Invoices.css';

/**
 * 請求書管理ページコンポーネント
 * 手数料ルールを選択して請求書を作成
 * 
 * 機能:
 * - テンプレート選択機能
 * - PDFダウンロード機能
 * - PDFプレビュー機能（フルスクリーン対応）
 * - メール送信機能
 * - 送付履歴表示機能
 * - 編集・削除ボタン縦並び
 */
const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // PDFプレビュー用のstate
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewInvoiceNumber, setPreviewInvoiceNumber] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  // メール送信用のstate
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    invoiceId: '',
    recipientEmail: '',
    senderEmailId: '',
    subject: '',
    body: '',
    attachPdf: true,
  });
  const [senderEmails, setSenderEmails] = useState([]);

  // 送付履歴表示用のstate
  const [showDeliveryHistory, setShowDeliveryHistory] = useState(false);
  const [selectedInvoiceDeliveries, setSelectedInvoiceDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const [formData, setFormData] = useState({
    partnerId: '',
    issueDate: '',
    dueDate: '',
    taxCategory: 'TAX_INCLUDED',
    status: 'DRAFT',
    notes: '',
    templateId: '',
    items: [{ commissionRuleId: '', description: '', quantity: 1, unitPrice: '' }],
  });

  // フィルター用のstate
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [partnerFilter, setPartnerFilter] = useState('ALL');

  useEffect(() => {
    document.title = '請求書管理 - PRM Tool';
    fetchData();
    fetchSenderEmails();
  }, []);

  // フィルター処理
  useEffect(() => {
    let filtered = [...invoices];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (partnerFilter !== 'ALL') {
      filtered = filtered.filter(i => i.partnerId === partnerFilter);
    }

    setFilteredInvoices(filtered);
  }, [statusFilter, partnerFilter, invoices]);

  /**
   * データ取得
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesData, partnersData, rulesData, templatesData] = await Promise.all([
        invoiceService.getAll(),
        partnerService.getAll(),
        commissionRuleService.getAll(),
        invoiceTemplateService.getAll(),
      ]);
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setPartners(partnersData);
      setCommissionRules(rulesData);
      setTemplates(templatesData);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 送信元メールアドレス一覧を取得
   */
  const fetchSenderEmails = async () => {
    try {
      const data = await invoiceDeliveryService.getAllSenderEmails();
      setSenderEmails(data);
    } catch (err) {
      console.error('送信元メールアドレスの取得に失敗:', err);
    }
  };

  // テンプレート管理画面へ遷移
  const handleNavigateToTemplates = () => {
    navigate('/invoice-templates');
  };

  /**
   * PDFダウンロード処理
   * 請求書のPDFファイルをダウンロード
   */
  const handleDownloadPdf = async (invoice) => {
    try {
      setDownloadingPdf(invoice.id);
      setError('');

      await invoiceService.downloadPdfFile(
        invoice.id,
        invoice.invoiceNumber,
        invoice.templateId
      );
    } catch (err) {
      console.error('PDFダウンロードエラー:', err);
      setError('PDFのダウンロードに失敗しました: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingPdf(null);
    }
  };

  /**
   * PDFプレビュー表示処理
   * モーダルでPDFをプレビュー
   */
  const handlePreviewPdf = async (invoice) => {
    try {
      setError('');

      const blob = await invoiceService.downloadPdf(
        invoice.id,
        invoice.templateId
      );

      const url = URL.createObjectURL(blob);

      setPreviewPdfUrl(url);
      setPreviewInvoiceNumber(invoice.invoiceNumber);
      setShowPdfPreview(true);
    } catch (err) {
      console.error('PDFプレビューエラー:', err);
      setError('PDFのプレビューに失敗しました: ' + (err.response?.data?.message || err.message));
    }
  };

  /**
   * PDFプレビューを閉じる
   * URLオブジェクトをクリーンアップ
   */
  const handleClosePdfPreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setPreviewInvoiceNumber('');
    setShowPdfPreview(false);
  };

  /**
   * メール送信モーダルを開く
   * 請求書とパートナー情報から初期値を設定
   */
  const handleOpenEmailModal = (invoice) => {
    const partner = partners.find(p => p.id === invoice.partnerId);
    const defaultSender = senderEmails.find(s => s.isDefault);

    setEmailFormData({
      invoiceId: invoice.id,
      recipientEmail: partner?.email || '',
      senderEmailId: defaultSender?.id || '',
      subject: `【請求書送付】${partner?.name || ''}（請求書番号: ${invoice.invoiceNumber}）`,
      body: generateDefaultEmailBody(invoice, partner),
      attachPdf: true,
    });

    setShowEmailModal(true);
  };

  /**
   * デフォルトのメール本文を生成
   * パートナー名、請求書番号、金額などを含む
   */
  const generateDefaultEmailBody = (invoice, partner) => {
    return `${partner?.name || ''} 御中

いつもお世話になっております。

下記の通り、請求書を送付いたします。

━━━━━━━━━━━━━━━━━━━━━━
請求書番号: ${invoice.invoiceNumber}
発行日: ${invoice.issueDate}
支払期限: ${invoice.dueDate}
合計金額: ${formatCurrency(invoice.totalAmount)}
━━━━━━━━━━━━━━━━━━━━━━

ご確認のほど、よろしくお願いいたします。

※本メールは自動送信されています。`;
  };

  /**
   * メール送信モーダルを閉じる
   */
  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setSendingEmail(false);
    setEmailFormData({
      invoiceId: '',
      recipientEmail: '',
      senderEmailId: '',
      subject: '',
      body: '',
      attachPdf: true,
    });
  };

  /**
   * メール送信フォームの入力変更処理
   */
  const handleEmailFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailFormData({
      ...emailFormData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  /**
   * メール送信処理
   * バックエンドAPIを呼び出して請求書をメール送信
   */
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!emailFormData.recipientEmail) {
      setError('宛先メールアドレスを入力してください');
      return;
    }

    if (!emailFormData.subject) {
      setError('件名を入力してください');
      return;
    }

    try {
      setSendingEmail(true);

      const response = await invoiceDeliveryService.sendInvoice(emailFormData);

      if (response.status === 'SENT') {
        alert('請求書を送信しました');
        handleCloseEmailModal();
      } else if (response.status === 'FAILED') {
        setError(`メール送信に失敗しました: ${response.errorMessage || '不明なエラー'}`);
      }
    } catch (err) {
      console.error('メール送信エラー:', err);
      setError('メール送信に失敗しました: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingEmail(false);
    }
  };

  /**
   * 送付履歴を表示
   * 指定した請求書の送付履歴を取得して表示
   */
  const handleShowDeliveryHistory = async (invoice) => {
    try {
      setLoadingDeliveries(true);
      setShowDeliveryHistory(true);

      const deliveries = await invoiceDeliveryService.getDeliveriesByInvoice(invoice.id);
      setSelectedInvoiceDeliveries(deliveries);
    } catch (err) {
      console.error('送付履歴取得エラー:', err);
      setError('送付履歴の取得に失敗しました');
    } finally {
      setLoadingDeliveries(false);
    }
  };

  /**
   * 送付履歴モーダルを閉じる
   */
  const handleCloseDeliveryHistory = () => {
    setShowDeliveryHistory(false);
    setSelectedInvoiceDeliveries([]);
  };

  /**
   * 選択可能な手数料ルールをフィルタリング
   */
  const getAvailableCommissionRules = () => {
    if (!formData.partnerId) {
      return [];
    }

    return commissionRules.filter(rule => {
      return rule.status === 'CONFIRMED' &&
        rule.projectPartnerId === formData.partnerId;
    });
  };

  /**
   * モーダル開閉処理
   */
  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        partnerId: invoice.partnerId,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        taxCategory: invoice.taxCategory || 'TAX_INCLUDED',
        status: invoice.status,
        notes: invoice.notes || '',
        templateId: invoice.templateId || '',
        items: invoice.items.map(item => ({
          commissionRuleId: item.commissionRuleId || '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    } else {
      setEditingInvoice(null);

      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const defaultTemplate = templates.find(t => t.isDefault);

      setFormData({
        partnerId: '',
        issueDate: today,
        dueDate: dueDateStr,
        taxCategory: 'TAX_INCLUDED',
        status: 'DRAFT',
        notes: '',
        templateId: defaultTemplate ? defaultTemplate.id : '',
        items: [{ commissionRuleId: '', description: '', quantity: 1, unitPrice: '' }],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'partnerId') {
      setFormData({
        ...formData,
        partnerId: value,
        items: formData.items.map(item => ({
          ...item,
          commissionRuleId: ''
        }))
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { commissionRuleId: '', description: '', quantity: 1, unitPrice: '' }],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      alert('最低1つの明細が必要です');
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingInvoice) {
        await invoiceService.update(editingInvoice.id, formData);
      } else {
        await invoiceService.create(formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || '請求書操作に失敗しました');
    }
  };

  const handleMarkAsPaid = async (invoice) => {
    const confirmed = window.confirm(
      `請求書番号: ${invoice.invoiceNumber}\n` +
      `パートナー: ${invoice.partnerName}\n` +
      `金額: ${formatCurrency(invoice.totalAmount)}\n\n` +
      `この請求書を支払済に変更しますか?\n` +
      `※この操作は取り消せません。`
    );

    if (!confirmed) return;

    try {
      await invoiceService.markAsPaid(invoice.id);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || '支払済への変更に失敗しました');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか?')) return;

    try {
      await invoiceService.delete(id);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || '削除に失敗しました');
      console.error(err);
    }
  };

  /**
   * 通貨形式で金額を表示
   */
  const formatCurrency = (amount) => {
    if (!amount) return '¥0';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  /**
   * ステータス表示ラベル
   */
  const getStatusLabel = (status) => {
    const statusMap = {
      DRAFT: '下書き',
      ISSUED: '発行済',
      PAID: '支払済',
      CANCELLED: 'キャンセル',
    };
    return statusMap[status] || status;
  };

  /**
   * ステータスに応じたCSSクラス
   */
  const getStatusClass = (status) => {
    const classMap = {
      DRAFT: 'status-draft',
      ISSUED: 'status-issued',
      PAID: 'status-paid',
      CANCELLED: 'status-cancelled',
    };
    return classMap[status] || '';
  };

  /**
   * 配信ステータス表示ラベル
   */
  const getDeliveryStatusLabel = (status) => {
    const statusMap = {
      SENT: '送信成功',
      FAILED: '送信失敗',
      PENDING: '送信待ち',
    };
    return statusMap[status] || status;
  };

  /**
   * 配信ステータスに応じたCSSクラス
   */
  const getDeliveryStatusClass = (status) => {
    const classMap = {
      SENT: 'delivery-status-sent',
      FAILED: 'delivery-status-failed',
      PENDING: 'delivery-status-pending',
    };
    return classMap[status] || '';
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <>
      <div className="invoices-container">
        <div className="page-header">
          <h1>請求書管理</h1>
          <div className="header-actions">
            <button onClick={handleNavigateToTemplates} className="btn-secondary">
              テンプレート管理
            </button>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              新規請求書作成
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* フィルターセクション */}
        <div className="filters">
          <div className="filter-group">
            <label>ステータス:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">すべて</option>
              <option value="DRAFT">下書き</option>
              <option value="ISSUED">発行済</option>
              <option value="PAID">支払済</option>
              <option value="CANCELLED">キャンセル</option>
            </select>
          </div>

          <div className="filter-group">
            <label>パートナー:</label>
            <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)}>
              <option value="ALL">すべて</option>
              {partners.map(partner => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 請求書一覧テーブル */}
        {filteredInvoices.length === 0 ? (
          <div className="no-data">請求書がありません</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>請求書番号</th>
                <th>パートナー</th>
                <th>発行日</th>
                <th>支払期限</th>
                <th>合計金額</th>
                <th>ステータス</th>
                <th>PDF</th>
                <th>メール</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.partnerName}</td>
                  <td>{invoice.issueDate}</td>
                  <td>{invoice.dueDate}</td>
                  <td className="text-right">{formatCurrency(invoice.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>

                  {/* PDF操作ボタン */}
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handlePreviewPdf(invoice)}
                        className="btn-preview"
                        title="PDFプレビュー"
                      >
                        👁️ プレビュー
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(invoice)}
                        className="btn-download"
                        disabled={downloadingPdf === invoice.id}
                        title="PDFダウンロード"
                      >
                        {downloadingPdf === invoice.id ? '⏳' : '📥'} ダウンロード
                      </button>
                    </div>
                  </td>

                  {/* メール操作ボタン */}
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleOpenEmailModal(invoice)}
                        className="btn-email"
                        disabled={invoice.status === 'DRAFT'}
                        title="メールで送付"
                      >
                        📧 送付
                      </button>
                      <button
                        onClick={() => handleShowDeliveryHistory(invoice)}
                        className="btn-history"
                        title="送付履歴"
                      >
                        📋 履歴
                      </button>
                    </div>
                  </td>

                  {/* 操作ボタン */}
                  <td>
                    <div className="table-actions">
                      {invoice.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleOpenModal(invoice)}
                            className="btn-edit"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="btn-delete"
                          >
                            削除
                          </button>
                        </>
                      )}

                      {invoice.status === 'ISSUED' && (
                        <button
                          onClick={() => handleMarkAsPaid(invoice)}
                          className="btn-primary"
                        >
                          支払済に変更
                        </button>
                      )}

                      {(invoice.status === 'PAID' || invoice.status === 'CANCELLED') && (
                        <span className="no-actions">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 請求書作成・編集モーダル */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>{editingInvoice ? '請求書編集' : '請求書作成'}</h2>
              <button onClick={handleCloseModal} className="close-button">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 基本情報セクション */}
              <div className="form-section">
                <h3>基本情報</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      パートナー <span className="required">*</span>
                    </label>
                    <select
                      name="partnerId"
                      value={formData.partnerId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">選択してください</option>
                      {partners.map(partner => (
                        <option key={partner.id} value={partner.id}>{partner.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      テンプレート <span className="required">*</span>
                    </label>
                    <select
                      name="templateId"
                      value={formData.templateId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">選択してください</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.templateName} {template.isDefault && '(デフォルト)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      発行日 <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      支払期限 <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>税区分</label>
                    <select
                      name="taxCategory"
                      value={formData.taxCategory}
                      onChange={handleChange}
                    >
                      <option value="TAX_INCLUDED">税込</option>
                      <option value="TAX_EXCLUDED">税抜</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ステータス</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="DRAFT">下書き</option>
                      <option value="ISSUED">発行済</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>備考</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="特記事項があれば入力してください"
                  />
                </div>
              </div>

              {/* 明細セクション */}
              <div className="form-section">
                <div className="section-header">
                  <h3>明細</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn-add-item"
                  >
                    + 明細を追加
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-number">{index + 1}</div>
                    <div className="item-fields">
                      <div className="invoices-form">
                        <label>
                          手数料ルール <span className="required">*</span>
                        </label>
                        <select
                          value={item.commissionRuleId}
                          onChange={(e) => handleItemChange(index, 'commissionRuleId', e.target.value)}
                          required
                        >
                          <option value="">選択してください</option>
                          {formData.partnerId ? (
                            getAvailableCommissionRules().map((rule) => (
                              <option key={rule.id} value={rule.id}>
                                {rule.ruleName} - {rule.projectName} ({rule.projectPartnerName})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>まずパートナーを選択してください</option>
                          )}
                        </select>

                        {!formData.partnerId && (
                          <small style={{ display: 'block', color: '#999', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                            ※手数料ルールを選択するには、まずパートナーを選択してください
                          </small>
                        )}

                        {formData.partnerId && getAvailableCommissionRules().length === 0 && (
                          <small style={{ display: 'block', color: '#e74c3c', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                            ※このパートナー向けの確定済手数料ルールがありません
                          </small>
                        )}
                      </div>

                      <div className="invoices-form">
                        <label>
                          説明 <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="商品・サービスの説明"
                          required
                        />
                      </div>

                      <div className="invoices-form">
                        <label>
                          数量 <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                        />
                      </div>

                      <div className="invoices-form">
                        <label>
                          単価 <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          min="0"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="btn-remove-item"
                        disabled={formData.items.length === 1}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  {editingInvoice ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDFプレビューモーダル - フルスクリーン対応 */}
      {showPdfPreview && (
        <div className="modal-overlay pdf-preview-overlay" onClick={handleClosePdfPreview}>
          <div
            className="modal-content pdf-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>請求書プレビュー - {previewInvoiceNumber}</h2>
              <button
                onClick={handleClosePdfPreview}
                className="close-button"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="pdf-preview-container">
              {previewPdfUrl && (
                <iframe
                  src={previewPdfUrl}
                  className="pdf-iframe"
                  title="Invoice PDF Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* メール送信モーダル */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>📧 請求書をメールで送付</h2>
              <button onClick={handleCloseEmailModal} className="close-button">×</button>
            </div>

            <form onSubmit={handleSendEmail}>
              <div className="form-group">
                <label>
                  宛先メールアドレス <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="recipientEmail"
                  value={emailFormData.recipientEmail}
                  onChange={handleEmailFormChange}
                  placeholder="partner@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>送信元メールアドレス</label>
                <select
                  name="senderEmailId"
                  value={emailFormData.senderEmailId}
                  onChange={handleEmailFormChange}
                >
                  <option value="">デフォルトを使用</option>
                  {senderEmails.map(sender => (
                    <option key={sender.id} value={sender.id}>
                      {sender.displayName} &lt;{sender.email}&gt;
                      {sender.isDefault && ' (デフォルト)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  件名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={emailFormData.subject}
                  onChange={handleEmailFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>本文</label>
                <textarea
                  name="body"
                  value={emailFormData.body}
                  onChange={handleEmailFormChange}
                  rows="10"
                  placeholder="メール本文を入力してください"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="attachPdf"
                    checked={emailFormData.attachPdf}
                    onChange={handleEmailFormChange}
                  />
                  PDFを添付する
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseEmailModal}
                  className="btn-cancel"
                  disabled={sendingEmail}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? '送信中...' : '📧 送信'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 送付履歴モーダル */}
      {showDeliveryHistory && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>📋 送付履歴</h2>
              <button onClick={handleCloseDeliveryHistory} className="close-button">×</button>
            </div>

            {loadingDeliveries ? (
              <div className="loading">読み込み中...</div>
            ) : selectedInvoiceDeliveries.length === 0 ? (
              <div className="no-data">送付履歴がありません</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>送信日時</th>
                    <th>宛先</th>
                    <th>送信元</th>
                    <th>件名</th>
                    <th>ステータス</th>
                    <th>送信者</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceDeliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td>{new Date(delivery.sentAt).toLocaleString('ja-JP')}</td>
                      <td>{delivery.recipientEmail}</td>
                      <td>{delivery.senderEmail}</td>
                      <td>{delivery.subject}</td>
                      <td>
                        <span className={`status-badge ${getDeliveryStatusClass(delivery.status)}`}>
                          {getDeliveryStatusLabel(delivery.status)}
                        </span>
                        {delivery.status === 'FAILED' && delivery.errorMessage && (
                          <div className="error-detail">{delivery.errorMessage}</div>
                        )}
                      </td>
                      <td>{delivery.sentBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="modal-actions">
              <button onClick={handleCloseDeliveryHistory} className="btn-cancel">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Invoices;
