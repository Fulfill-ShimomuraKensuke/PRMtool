import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import partnerService from '../services/partnerService';
import commissionRuleService from '../services/commissionRuleService';
import './Invoices.css';

/**
 * 請求書管理ページコンポーネント
 * 手数料ルールを選択して請求書を作成
 */
const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    partnerId: '',
    issueDate: '',
    dueDate: '',
    taxCategory: 'TAX_INCLUDED',
    status: 'DRAFT',
    notes: '',
    items: [{ commissionRuleId: '', description: '', quantity: 1, unitPrice: '' }],
  });

  // フィルター用のstate
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [partnerFilter, setPartnerFilter] = useState('ALL');

  useEffect(() => {
    document.title = '請求書管理 - PRM Tool';
    fetchData();
  }, []);

  // フィルター処理
  useEffect(() => {
    let filtered = [...invoices];

    // ステータスでフィルター
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    // パートナーでフィルター
    if (partnerFilter !== 'ALL') {
      filtered = filtered.filter(i => i.partnerId === partnerFilter);
    }

    setFilteredInvoices(filtered);
  }, [statusFilter, partnerFilter, invoices]);

  // データ取得
  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesData, partnersData, rulesData] = await Promise.all([
        invoiceService.getAll(),
        partnerService.getAll(),
        commissionRuleService.getAll(),
      ]);
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setPartners(partnersData);
      setCommissionRules(rulesData);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // テンプレート管理画面へ遷移
  const handleNavigateToTemplates = () => {
    navigate('/invoice-templates');
  };

  // 選択可能な手数料ルールをフィルタリング
  // 請求書のパートナーに紐づく手数料ルールのみを表示
  const getAvailableCommissionRules = () => {
    if (!formData.partnerId) {
      // パートナー未選択時は空配列を返す（選択不可）
      return [];
    }

    // 選択したパートナーに紐づく手数料ルールのみ表示
    return commissionRules.filter(rule => {
      // 確定済みかつ、手数料ルールの案件のパートナーIDが請求書のパートナーIDと一致
      return rule.status === 'CONFIRMED' &&
        rule.projectPartnerId === formData.partnerId;
    });
  };

  // モーダル開閉処理（新規作成または編集）
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
        items: invoice.items.map(item => ({
          commissionRuleId: item.commissionRuleId || '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    } else {
      setEditingInvoice(null);
      // デフォルトの発行日と支払期限を設定
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      setFormData({
        partnerId: '',
        issueDate: today,
        dueDate: dueDateStr,
        taxCategory: 'TAX_INCLUDED',
        status: 'DRAFT',
        notes: '',
        items: [{ commissionRuleId: '', description: '', quantity: 1, unitPrice: '' }],
      });
    }
    setShowModal(true);
  };

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setError('');
  };

  // フォーム入力変更処理
  const handleChange = (e) => {
    const { name, value } = e.target;

    // パートナーが変更された場合、明細の手数料ルールをクリア
    if (name === 'partnerId') {
      setFormData({
        ...formData,
        partnerId: value,
        items: formData.items.map(item => ({
          ...item,
          commissionRuleId: ''  // 手数料ルールをクリア
        }))
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // 明細の変更処理
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  // 明細を追加
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { commissionRuleId: '', description: '', quantity: 1, unitPrice: '' }],
    });
  };

  // 明細を削除
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

  // フォーム送信処理（作成または更新）
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

  // 請求書を「支払済」に変更する処理
  const handleMarkAsPaid = async (invoice) => {
    // 確認ダイアログを表示
    const confirmed = window.confirm(
      `請求書番号: ${invoice.invoiceNumber}\n` +
      `パートナー: ${invoice.partnerName}\n` +
      `金額: ${formatCurrency(invoice.totalAmount)}\n\n` +
      `この請求書を支払済に変更しますか？\n` +
      `※この操作は取り消せません。`
    );

    if (!confirmed) return;

    try {
      await invoiceService.markAsPaid(invoice.id);
      await fetchData(); // データを再取得
    } catch (err) {
      setError(err.response?.data?.message || '支払済への変更に失敗しました');
      console.error(err);
    }
  };

  // 請求書削除処理
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか?')) return;

    try {
      await invoiceService.delete(id);
      await fetchData();
    } catch (err) {
      setError('請求書の削除に失敗しました');
      console.error(err);
    }
  };

  // ステータスを日本語表示に変換
  const getStatusLabel = (status) => {
    switch (status) {
      case 'DRAFT':
        return '下書き';
      case 'ISSUED':
        return '発行済';
      case 'PAID':
        return '支払済';
      case 'CANCELLED':
        return 'キャンセル';
      default:
        return status;
    }
  };

  // 消費税区分を日本語表示に変換
  const getTaxCategoryLabel = (taxCategory) => {
    switch (taxCategory) {
      case 'TAX_INCLUDED':
        return 'あり（商品＋手数料に課税）';
      case 'TAX_ON_PRODUCT_ONLY':
        return '手数料抜き（商品のみ課税）';
      case 'TAX_EXEMPT':
        return 'なし（非課税）';
      default:
        return taxCategory;
    }
  };

  // 金額をフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  // フィルタークリア
  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setPartnerFilter('ALL');
  };

  // フィルターが適用されているかチェック
  const hasActiveFilters = statusFilter !== 'ALL' || partnerFilter !== 'ALL';

  return (
    <>
      <div className="invoices-container">
        <div className="invoices-header">
          <h1>📄 請求書管理</h1>
          <div className="header-buttons">
            <button className="btn-secondary" onClick={handleNavigateToTemplates}>
              📋 テンプレート管理
            </button>
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              + 新規請求書作成
            </button>
          </div>
        </div>

        {/* フィルターエリア */}
        <div className="filter-section">
          <div className="filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">全てのステータス</option>
              <option value="DRAFT">下書き</option>
              <option value="ISSUED">発行済</option>
              <option value="PAID">支払済</option>
              <option value="CANCELLED">キャンセル</option>
            </select>

            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">全てのパートナー</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="btn-clear-filters">
                フィルターをクリア
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="search-results-info">
              {filteredInvoices.length}件の請求書が見つかりました
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : filteredInvoices.length === 0 ? (
          <p className="no-data">
            {hasActiveFilters
              ? 'フィルター条件に一致する請求書がありません'
              : '請求書がまだありません。新規作成してください。'}
          </p>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>請求書番号</th>
                <th>パートナー名</th>
                <th>発行日</th>
                <th>支払期限</th>
                <th>消費税区分</th>
                <th>合計金額</th>
                <th>ステータス</th>
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
                  <td>{getTaxCategoryLabel(invoice.taxCategory)}</td>
                  <td>{formatCurrency(invoice.totalAmount)}</td>
                  <td>
                    <span className={`status-badge status-${invoice.status.toLowerCase()}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="table-actions">
                    {/* 下書きの場合：編集・削除が可能 */}
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

                    {/* 発行済の場合：支払済に変更ボタンのみ */}
                    {invoice.status === 'ISSUED' && (
                      <button
                        onClick={() => handleMarkAsPaid(invoice)}
                        className="btn-primary"
                      >
                        支払済に変更
                      </button>
                    )}

                    {/* 支払済・キャンセルの場合：操作なし */}
                    {(invoice.status === 'PAID' || invoice.status === 'CANCELLED') && (
                      <span className="no-actions">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>{editingInvoice ? '請求書編集' : '請求書作成'}</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="invoices-form-grid">
                <div className="invoices-form">
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
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="invoices-form">
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

                <div className="invoices-form">
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

                <div className="invoices-form">
                  <label>
                    消費税区分 <span className="required">*</span>
                  </label>
                  <select
                    name="taxCategory"
                    value={formData.taxCategory}
                    onChange={handleChange}
                    required
                  >
                    <option value="TAX_INCLUDED">あり（商品＋手数料に課税）</option>
                    <option value="TAX_ON_PRODUCT_ONLY">手数料抜き（商品のみ課税）</option>
                    <option value="TAX_EXEMPT">なし（非課税）</option>
                  </select>
                </div>

                <div className="invoices-form">
                  <label>
                    ステータス <span className="required">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={editingInvoice?.status === 'ISSUED' || editingInvoice?.status === 'PAID'}
                  >
                    <option value="DRAFT">下書き</option>
                    <option value="ISSUED">発行済</option>
                    <option value="PAID">支払済</option>
                    <option value="CANCELLED">キャンセル</option>
                  </select>
                  {(editingInvoice?.status === 'ISSUED' || editingInvoice?.status === 'PAID') && (
                    <small className="invoices-form-hint">
                      発行済・支払済のステータスは「支払済に変更」ボタンから変更してください
                    </small>
                  )}
                </div>
              </div>

              <div className="invoices-form" style={{ padding: '0 1.5rem' }}>
                <label>備考</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="備考を入力してください"
                />
              </div>

              {/* 明細セクション */}
              <div className="items-section">
                <div className="items-header">
                  <h3>明細</h3>
                  <button type="button" onClick={handleAddItem} className="btn-add-item">
                    + 明細を追加
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-number">明細 {index + 1}</div>
                    <div className="item-fields">
                      <div className='invoices-form-group'>
                        <div className="invoices-form">
                          <label>
                            数量 <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value))
                            }
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
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      <div className="invoices-form">
                        <label>手数料ルール</label>
                        <select
                          value={item.commissionRuleId}
                          onChange={(e) => handleItemChange(index, 'commissionRuleId', e.target.value)}
                          disabled={!formData.partnerId}  // パートナー未選択時は無効化
                        >
                          <option value="">手数料ルールなし</option>
                          {formData.partnerId ? (
                            // パートナー選択済み：フィルタリングされたルールのみ表示
                            getAvailableCommissionRules().map((rule) => (
                              <option key={rule.id} value={rule.id}>
                                {rule.ruleName} - {rule.projectName} ({rule.projectPartnerName})
                              </option>
                            ))
                          ) : (
                            // パートナー未選択：選択肢なし
                            <option value="" disabled>まずパートナーを選択してください</option>
                          )}
                        </select>

                        {/* パートナー未選択時の注意メッセージ */}
                        {!formData.partnerId && (
                          <small style={{ display: 'block', color: '#999', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                            ※手数料ルールを選択するには、まずパートナーを選択してください
                          </small>
                        )}

                        {/* 選択可能なルールがない場合 */}
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
    </>
  );
};

export default Invoices;