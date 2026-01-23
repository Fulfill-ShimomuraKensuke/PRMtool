import { useState, useEffect } from 'react';
import commissionRuleService from '../services/commissionRuleService';
import projectService from '../services/projectService';
import './CommissionRules.css';

/**
 * 手数料ルール管理ページ
 * 新設計対応版
 */
const CommissionRules = () => {
  const [rules, setRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    ruleName: '',
    commissionType: 'RATE',
    ratePercent: '',
    fixedAmount: '',
    status: 'UNAPPROVED',
    notes: '',
  });

  // フィルター用のstate
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  useEffect(() => {
    document.title = '手数料ルール管理 - PRM Tool';
    fetchData();
  }, []);

  // フィルター処理
  useEffect(() => {
    let filtered = [...rules];

    // ステータスでフィルター
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // 案件でフィルター
    if (projectFilter !== 'ALL') {
      filtered = filtered.filter(r => r.projectId === projectFilter);
    }

    setFilteredRules(filtered);
  }, [statusFilter, projectFilter, rules]);

  // データ取得
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesData, projectsData] = await Promise.all([
        commissionRuleService.getAll(),
        projectService.getAll(),
      ]);
      setRules(rulesData);
      setFilteredRules(rulesData);
      setProjects(projectsData);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // モーダル開閉処理
  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        projectId: rule.projectId,
        ruleName: rule.ruleName,
        commissionType: rule.commissionType,
        ratePercent: rule.ratePercent || '',
        fixedAmount: rule.fixedAmount || '',
        status: rule.status,
        notes: rule.notes || '',
      });
    } else {
      setEditingRule(null);
      setFormData({
        projectId: '',
        ruleName: '',
        commissionType: 'RATE',
        ratePercent: '',
        fixedAmount: '',
        status: 'UNAPPROVED',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setFormData({
      projectId: '',
      ruleName: '',
      commissionType: 'RATE',
      ratePercent: '',
      fixedAmount: '',
      status: 'UNAPPROVED',
      notes: '',
    });
  };

  // フォーム入力変更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // タイプ変更時に該当しないフィールドをクリア
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      commissionType: newType,
      ratePercent: newType === 'RATE' ? prev.ratePercent : '',
      fixedAmount: newType === 'FIXED' ? prev.fixedAmount : '',
    }));
  };

  // 保存処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // バリデーション
      if (!formData.projectId || !formData.ruleName) {
        alert('案件とルール名は必須です');
        return;
      }

      if (formData.commissionType === 'RATE' && !formData.ratePercent) {
        alert('手数料率を入力してください');
        return;
      }

      if (formData.commissionType === 'FIXED' && !formData.fixedAmount) {
        alert('固定金額を入力してください');
        return;
      }

      const payload = {
        projectId: formData.projectId,
        ruleName: formData.ruleName,
        commissionType: formData.commissionType,
        ratePercent: formData.commissionType === 'RATE' ? parseFloat(formData.ratePercent) : null,
        fixedAmount: formData.commissionType === 'FIXED' ? parseFloat(formData.fixedAmount) : null,
        status: formData.status,
        notes: formData.notes,
      };

      if (editingRule) {
        await commissionRuleService.update(editingRule.id, payload);
      } else {
        await commissionRuleService.create(payload);
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Save error:', err);
      alert('保存に失敗しました');
    }
  };

  // 削除処理
  const handleDelete = async (id) => {
    if (!window.confirm('この手数料ルールを削除してもよろしいですか？')) {
      return;
    }

    try {
      await commissionRuleService.delete(id);
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      alert('削除に失敗しました');
    }
  };

  // フィルタークリア
  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setProjectFilter('ALL');
  };

  // フィルターが適用されているかチェック
  const hasActiveFilters = statusFilter !== 'ALL' || projectFilter !== 'ALL';

  // ステータスラベル取得
  const getStatusLabel = (status) => {
    const labels = {
      UNAPPROVED: '未承認',
      REVIEWING: '確認中',
      CONFIRMED: '確定',
      PAID: '支払済',
      DISABLED: '使用不可'
    };
    return labels[status] || status;
  };

  // ステータスクラス取得
  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  // タイプラベル取得
  const getTypeLabel = (type) => {
    const labels = {
      RATE: '%指定',
      FIXED: '固定金額'
    };
    return labels[type] || type;
  };

  // 手数料表示
  const formatCommission = (rule) => {
    if (rule.commissionType === 'RATE') {
      return `${rule.ratePercent}%`;
    } else {
      return `¥${rule.fixedAmount?.toLocaleString()}/件`;
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="commissions-container">
      <div className="commissions-header">
        <h1>💰 手数料ルール管理</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + 新規作成
        </button>
      </div>

      {/* フィルターセクション */}
      <div className="filter-section">
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">全てのステータス</option>
            <option value="UNAPPROVED">未承認</option>
            <option value="REVIEWING">確認中</option>
            <option value="CONFIRMED">確定</option>
            <option value="PAID">支払済</option>
            <option value="DISABLED">使用不可</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">全ての案件</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
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
            {filteredRules.length}件の手数料ルールが見つかりました
          </div>
        )}
      </div>

      {/* 手数料ルール一覧 */}
      {filteredRules.length === 0 ? (
        <div className="no-data">
          {hasActiveFilters
            ? 'フィルター条件に一致する手数料ルールがありません'
            : '手数料ルールがまだありません。新規作成してください。'}
        </div>
      ) : (
        <div className="commissions-list">
          {filteredRules.map(rule => (
            <div key={rule.id} className="commission-card">
              <div className="commission-header">
                <div className="commission-title">
                  <h3>{rule.ruleName}</h3>
                  <p className="commission-project">案件: {rule.projectName}</p>
                </div>
                <span className={getStatusClass(rule.status)}>
                  {getStatusLabel(rule.status)}
                </span>
              </div>

              <div className="commission-body">
                <div className="commission-info">
                  <div className="info-item">
                    <span className="info-label">タイプ:</span>
                    <span className="info-value type-badge">{getTypeLabel(rule.commissionType)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">手数料:</span>
                    <span className="info-value commission-amount">{formatCommission(rule)}</span>
                  </div>
                  {rule.notes && (
                    <div className="info-item full-width">
                      <span className="info-label">備考:</span>
                      <span className="info-value">{rule.notes}</span>
                    </div>
                  )}
                </div>

                <div className="commission-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleOpenModal(rule)}
                  >
                    編集
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(rule.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* モーダル */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRule ? '手数料ルール編集' : '手数料ルール作成'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  案件 <span className="required">*</span>
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                >
                  <option value="">選択してください</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  ルール名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="ruleName"
                  value={formData.ruleName}
                  onChange={handleChange}
                  placeholder="例: 初期契約"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  手数料タイプ <span className="required">*</span>
                </label>
                <select
                  name="commissionType"
                  value={formData.commissionType}
                  onChange={handleTypeChange}
                  required
                >
                  <option value="RATE">%指定</option>
                  <option value="FIXED">固定金額</option>
                </select>
              </div>

              {formData.commissionType === 'RATE' && (
                <div className="form-group conditional-field">
                  <label>
                    手数料率（%） <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="ratePercent"
                    value={formData.ratePercent}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="例: 3.5"
                    required
                  />
                </div>
              )}

              {formData.commissionType === 'FIXED' && (
                <div className="form-group conditional-field">
                  <label>
                    固定金額（円） <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="fixedAmount"
                    value={formData.fixedAmount}
                    onChange={handleChange}
                    step="1"
                    min="0"
                    placeholder="例: 5000"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>
                  ステータス <span className="required">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="UNAPPROVED">未承認</option>
                  <option value="REVIEWING">確認中</option>
                  <option value="CONFIRMED">確定</option>
                  <option value="PAID">支払済</option>
                  <option value="DISABLED">使用不可</option>
                </select>
              </div>

              <div className="form-group">
                <label>備考</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="備考を入力"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionRules;