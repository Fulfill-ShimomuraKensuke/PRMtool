import { useState, useEffect } from 'react';
import commissionService from '../services/commissionService';
import projectService from '../services/projectService';
import partnerService from '../services/partnerService';
import './Commissions.css';

// 手数料管理ページコンポーネント
const Commissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [filteredCommissions, setFilteredCommissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    partnerId: '',
    baseAmount: '',
    rate: '',
    status: 'PENDING',
    paymentDate: '',
    notes: '',
  });

  // フィルター用のstate
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [partnerFilter, setPartnerFilter] = useState('ALL');

  useEffect(() => {
    document.title = '手数料管理 - PRM Tool';
    fetchData();
  }, []);

  // フィルター処理
  useEffect(() => {
    let filtered = [...commissions];

    // ステータスでフィルター
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // パートナーでフィルター
    if (partnerFilter !== 'ALL') {
      filtered = filtered.filter(c => c.partnerId === partnerFilter);
    }

    setFilteredCommissions(filtered);
  }, [statusFilter, partnerFilter, commissions]);

  // データ取得
  const fetchData = async () => {
    try {
      setLoading(true);
      const [commissionsData, projectsData, partnersData] = await Promise.all([
        commissionService.getAll(),
        projectService.getAll(),
        partnerService.getAll(),
      ]);
      setCommissions(commissionsData);
      setFilteredCommissions(commissionsData);
      setProjects(projectsData);
      setPartners(partnersData);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // モーダル開閉処理（新規作成または編集）
  const handleOpenModal = (commission = null) => {
    if (commission) {
      setEditingCommission(commission);
      setFormData({
        projectId: commission.projectId,
        partnerId: commission.partnerId,
        baseAmount: commission.baseAmount,
        rate: commission.rate,
        status: commission.status,
        paymentDate: commission.paymentDate || '',
        notes: commission.notes || '',
      });
    } else {
      setEditingCommission(null);
      setFormData({
        projectId: '',
        partnerId: '',
        baseAmount: '',
        rate: '',
        status: 'PENDING',
        paymentDate: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCommission(null);
    setError('');
  };

  // フォーム入力変更処理
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // フォーム送信処理（作成または更新）
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingCommission) {
        await commissionService.update(editingCommission.id, formData);
      } else {
        await commissionService.create(formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || '手数料操作に失敗しました');
    }
  };

  // 手数料削除処理
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか?')) return;

    try {
      await commissionService.delete(id);
      await fetchData();
    } catch (err) {
      setError('手数料の削除に失敗しました');
      console.error(err);
    }
  };

  // ステータスを日本語表示に変換
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return '未承認';
      case 'APPROVED':
        return '承認済';
      case 'PAID':
        return '支払済';
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
      <div className="commissions-container">
        <div className="commissions-header">
          <h1>手数料管理</h1>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + 新規手数料作成
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
              <option value="PENDING">未承認</option>
              <option value="APPROVED">承認済</option>
              <option value="PAID">支払済</option>
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
              {filteredCommissions.length}件の手数料が見つかりました
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : filteredCommissions.length === 0 ? (
          <p className="no-data">
            {hasActiveFilters ? '検索条件に一致する手数料がありません' : '手数料がありません'}
          </p>
        ) : (
          <table className="commissions-table">
            <thead>
              <tr>
                <th>案件名</th>
                <th>パートナー名</th>
                <th>基準金額</th>
                <th>手数料率</th>
                <th>手数料金額</th>
                <th>ステータス</th>
                <th>支払日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map((commission) => (
                <tr key={commission.id}>
                  <td>{commission.projectName}</td>
                  <td>{commission.partnerName}</td>
                  <td>{formatCurrency(commission.baseAmount)}</td>
                  <td>{commission.rate}%</td>
                  <td>{formatCurrency(commission.amount)}</td>
                  <td>
                    <span className={`status-badge status-${commission.status.toLowerCase()}`}>
                      {getStatusLabel(commission.status)}
                    </span>
                  </td>
                  <td>{commission.paymentDate || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => handleOpenModal(commission)} className="btn-edit">
                        編集
                      </button>
                      <button onClick={() => handleDelete(commission.id)} className="btn-delete-small">
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
            <div className="modal-content">
              <h2>{editingCommission ? '手数料編集' : '新規手数料作成'}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>案件 *</label>
                  <select name="projectId" value={formData.projectId} onChange={handleChange} required>
                    <option value="">選択してください</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <label>基準金額 *</label>
                  <input
                    type="number"
                    name="baseAmount"
                    value={formData.baseAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>手数料率 (%) *</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>ステータス *</label>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="PENDING">未承認</option>
                    <option value="APPROVED">承認済</option>
                    <option value="PAID">支払済</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>支払日</label>
                  <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>備考</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                    キャンセル
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingCommission ? '更新' : '作成'}
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

export default Commissions;
