import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import partnerService from '../services/partnerService';
import commissionRuleService from '../services/commissionRuleService';
import invoiceService from '../services/invoiceService';
import './Dashboard.css';

/**
 * ダッシュボードページコンポーネント
 * 新設計対応版
 */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 状態管理
  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // タブ管理（デフォルトは「基本統計」）
  const [activeTab, setActiveTab] = useState('overview');

  // 全データを取得
  const fetchAllData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // 並列で全データを取得
      const [projectsData, partnersData, rulesData, invoicesData] = await Promise.all([
        projectService.getAll(user?.id),
        partnerService.getAll(),
        commissionRuleService.getAll(),
        invoiceService.getAll(),
      ]);

      setProjects(projectsData);
      setPartners(partnersData);
      setCommissionRules(rulesData);
      setInvoices(invoicesData);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    document.title = 'ダッシュボード - PRM Tool';
    fetchAllData();
  }, [fetchAllData]);

  // 案件ステータスのラベル取得
  const getProjectStatusLabel = (status) => {
    const labels = {
      NEW: '新規',
      IN_PROGRESS: '進行中',
      DONE: '完了'
    };
    return labels[status] || status;
  };

  // 案件ステータスクラス名取得
  const getProjectStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  // 金額をフォーマット
  const formatCurrency = (amount) => {
    if (!amount) return '¥0';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  // 案件カードをクリックで詳細画面へ遷移
  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // ステータス別に案件を分類
  const projectsByStatus = {
    NEW: projects.filter(p => p.status === 'NEW'),
    IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS'),
    DONE: projects.filter(p => p.status === 'DONE')
  };

  // ステータス別に請求書を分類
  const invoicesByStatus = {
    DRAFT: invoices.filter(i => i.status === 'DRAFT'),
    ISSUED: invoices.filter(i => i.status === 'ISSUED'),
    PAID: invoices.filter(i => i.status === 'PAID'),
    CANCELLED: invoices.filter(i => i.status === 'CANCELLED')
  };

  // 請求書の合計金額を計算
  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 ダッシュボード</h1>
        <p>ようこそ、{user?.name}さん</p>
      </div>

      {/* 統計カード */}
      <div className="stats-cards">
        <div className="stat-card stat-partners" onClick={() => navigate('/partners')}>
          <h3>パートナー数</h3>
          <p className="stat-number">{partners.length}</p>
          <p className="stat-detail">登録企業</p>
        </div>

        <div className="stat-card stat-projects" onClick={() => setActiveTab('projects')}>
          <h3>総案件数</h3>
          <p className="stat-number">{projects.length}</p>
          <p className="stat-detail">全ステータス</p>
        </div>

        <div className="stat-card stat-commissions" onClick={() => navigate('/commissions')}>
          <h3>手数料ルール数</h3>
          <p className="stat-number">{commissionRules.length}</p>
          <p className="stat-detail">登録ルール</p>
        </div>

        <div className="stat-card stat-invoices" onClick={() => setActiveTab('invoices')}>
          <h3>請求書数</h3>
          <p className="stat-number">{invoices.length}</p>
          <p className="stat-detail">全ステータス</p>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          基本統計
        </button>
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          案件ステータス
        </button>
        <button
          className={`tab-button ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          請求書ステータス
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="tab-content">
        {/* 基本統計タブ */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-grid">
              {/* 案件サマリー */}
              <div className="overview-card">
                <h3>📁 案件サマリー</h3>
                <div className="overview-stats">
                  <div className="overview-item">
                    <span>新規</span>
                    <strong>{projectsByStatus.NEW.length}件</strong>
                  </div>
                  <div className="overview-item">
                    <span>進行中</span>
                    <strong>{projectsByStatus.IN_PROGRESS.length}件</strong>
                  </div>
                  <div className="overview-item">
                    <span>完了</span>
                    <strong>{projectsByStatus.DONE.length}件</strong>
                  </div>
                </div>
              </div>

              {/* 請求書サマリー */}
              <div className="overview-card">
                <h3>📄 請求書サマリー</h3>
                <div className="overview-stats">
                  <div className="overview-item">
                    <span>総請求金額</span>
                    <strong>{formatCurrency(totalInvoiceAmount)}</strong>
                  </div>
                  <div className="overview-item">
                    <span>発行済</span>
                    <strong>{invoicesByStatus.ISSUED.length}件</strong>
                  </div>
                  <div className="overview-item">
                    <span>支払済</span>
                    <strong>{invoicesByStatus.PAID.length}件</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 案件ステータスタブ */}
        {activeTab === 'projects' && (
          <div className="stats-section">
            <div className="stats-cards">
              <div className="stat-card stat-new">
                <h3>新規</h3>
                <p className="stat-number">{projectsByStatus.NEW.length}件</p>
                <p className="stat-detail">未着手</p>
              </div>
              <div className="stat-card stat-progress">
                <h3>進行中</h3>
                <p className="stat-number">{projectsByStatus.IN_PROGRESS.length}件</p>
                <p className="stat-detail">作業中</p>
              </div>
              <div className="stat-card stat-done">
                <h3>完了</h3>
                <p className="stat-number">{projectsByStatus.DONE.length}件</p>
                <p className="stat-detail">終了</p>
              </div>
            </div>

            {/* 最近の案件 */}
            <div className="recent-projects">
              <h2>📋 最近の案件</h2>
              {projects.length === 0 ? (
                <p className="no-data">案件がまだありません</p>
              ) : (
                <>
                  <div className="projects-list">
                    {projects.slice(0, 5).map(project => (
                      <div
                        key={project.id}
                        className="project-item"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <div className="project-item-header">
                          <h3>{project.name}</h3>
                          <span className={getProjectStatusClass(project.status)}>
                            {getProjectStatusLabel(project.status)}
                          </span>
                        </div>
                        <div className="project-item-details">
                          <p>パートナー: {project.partnerName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="info-button"
                    onClick={() => navigate('/projects')}
                  >
                    案件一覧を見る
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 請求書ステータスタブ */}
        {activeTab === 'invoices' && (
          <div className="stats-section">
            <div className="stats-cards">
              <div className="stat-card stat-invoice-draft">
                <h3>下書き</h3>
                <p className="stat-number">{invoicesByStatus.DRAFT.length}件</p>
                <p className="stat-detail">未発行</p>
              </div>
              <div className="stat-card stat-invoice-issued">
                <h3>発行済</h3>
                <p className="stat-number">{invoicesByStatus.ISSUED.length}件</p>
                <p className="stat-detail">支払待ち</p>
              </div>
              <div className="stat-card stat-invoice-paid">
                <h3>支払済</h3>
                <p className="stat-number">{invoicesByStatus.PAID.length}件</p>
                <p className="stat-detail">完了</p>
              </div>
              <div className="stat-card stat-invoice-cancelled">
                <h3>キャンセル</h3>
                <p className="stat-number">{invoicesByStatus.CANCELLED.length}件</p>
                <p className="stat-detail">無効</p>
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="info-section">
              <div className="info-card">
                <h3>📄 請求書サマリー</h3>
                <div className="info-details">
                  <div className="info-row">
                    <span>総請求金額:</span>
                    <strong>{formatCurrency(totalInvoiceAmount)}</strong>
                  </div>
                  <div className="info-row">
                    <span>総件数:</span>
                    <strong>{invoices.length}件</strong>
                  </div>
                  <div className="info-row">
                    <span>平均請求額:</span>
                    <strong>
                      {invoices.length > 0
                        ? formatCurrency(totalInvoiceAmount / invoices.length)
                        : '¥0'}
                    </strong>
                  </div>
                </div>
                <button
                  className="info-button"
                  onClick={() => navigate('/invoices')}
                >
                  請求書管理画面へ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;