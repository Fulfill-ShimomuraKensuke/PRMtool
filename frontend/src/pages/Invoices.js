import { useState, useEffect } from 'react';
import invoiceService from '../services/invoiceService';
import partnerService from '../services/partnerService';
import commissionService from '../services/commissionService';
import './Invoices.css';

// 請求書管理ページコンポーネント
const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    partnerId: '',
    issueDate: '',
    dueDate: '',
    status: 'DRAFT',
    notes: '',
    items: [{ commissionId: '', description: '', quantity: 1, unitPrice: '' }],
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
      const [invoicesData, partnersData, commissionsData] = await Promise.all([
        invoiceService.getAll(),
        partnerService.getAll(),
        commissionService.getAll(),
      ]);
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setPartners(partnersData);
      setCommissions(commissionsData);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // モーダル開閉処理（新規作成または編集）
  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        partnerId: invoice.partnerId,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        notes: invoice.notes || '',
        items: invoice.items.map(item => ({
          commissionId: item.commissionId || '',
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
        status: 'DRAFT',
        notes: '',
        items: [{ commissionId: '', description: '', quantity: 1, unitPrice: '' }],
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      items: [...formData.items, { commissionId: '', description: '', quantity: 1, unitPrice: '' }],
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
          <h1>請求書管理</h1>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + 新規請求書作成
          </button>
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
            {hasActiveFilters ? '検索条件に一致する請求書がありません' : '請求書がありません'}
          </p>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>請求書番号</th>
                <th>パートナー名</th>
                <th>発行日</th>
                <th>支払期限</th>
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
                  <td>{formatCurrency(invoice.totalAmount)}</td>
                  <td>
                    <span className={`status-badge status-${invoice.status.toLowerCase()}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => handleOpenModal(invoice)} className="btn-edit">
                        編集
                      </button>
                      <button onClick={() => handleDelete(invoice.id)} className="btn-delete-small">
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content modal-large">
              <h2>{editingInvoice ? '請求書編集' : '新規請求書作成'}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>パートナー *</label>
                    <select name="partnerId" value={formData.partnerId} onChange={handleChange} required>
                      <option value="">選択してください</option>
                      {partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>ステータス *</label>
                    <select name="status" value={formData.status} onChange={handleChange} required>
                      <option value="DRAFT">下書き</option>
                      <option value="ISSUED">発行済</option>
                      <option value="PAID">支払済</option>
                      <option value="CANCELLED">キャンセル</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>発行日 *</label>
                    <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>支払期限 *</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>備考</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" />
                </div>

                <div className="invoice-items-section">
                  <div className="items-header">
                    <h3>請求明細</h3>
                    <button type="button" className="btn-add-item" onClick={handleAddItem}>
                      + 明細追加
                    </button>
                  </div>

                  {formData.items.map((item, index) => (
                    <div key={index} className="invoice-item">
                      <div className="item-header">
                        <span>明細 {index + 1}</span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => handleRemoveItem(index)}
                          >
                            削除
                          </button>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>手数料（任意）</label>
                          <select
                            value={item.commissionId}
                            onChange={(e) => handleItemChange(index, 'commissionId', e.target.value)}
                          >
                            <option value="">選択なし</option>
                            {commissions.map((commission) => (
                              <option key={commission.id} value={commission.id}>
                                {commission.projectName} - {formatCurrency(commission.amount)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>説明 *</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>数量 *</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            required
                            min="1"
                          />
                        </div>
                        <div className="form-group">
                          <label>単価 *</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                    キャンセル
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingInvoice ? '更新' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Invoices;
