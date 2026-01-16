import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import partnerService from '../services/partnerService';
import commissionService from '../services/commissionService';
import invoiceService from '../services/invoiceService';
import './Dashboard.css';

// ダッシュボードページコンポーネント
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 状態管理
  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [commissions, setCommissions] = useState([]);
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
      const [projectsData, partnersData, commissionsData, invoicesData] = await Promise.all([
        projectService.getAll(user?.id),
        partnerService.getAll(),
        commissionService.getAll(),
        invoiceService.getAll(),
      ]);

      setProjects(projectsData);
      setPartners(partnersData);
      setCommissions(commissionsData);
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

  // ステータス別に手数料を分類して集計
  const commissionsByStatus = {
    PENDING: commissions.filter(c => c.status === 'PENDING'),
    APPROVED: commissions.filter(c => c.status === 'APPROVED'),
    PAID: commissions.filter(c => c.status === 'PAID')
  };

  // 手数料の総額計算
  const totalCommissionAmount = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const pendingCommissionAmount = commissionsByStatus.PENDING.reduce((sum, c) => sum + (c.amount || 0), 0);
  const approvedCommissionAmount = commissionsByStatus.APPROVED.reduce((sum, c) => sum + (c.amount || 0), 0);
  const paidCommissionAmount = commissionsByStatus.PAID.reduce((sum, c) => sum + (c.amount || 0), 0);

  // ステータス別に請求書を分類
  const invoicesByStatus = {
    DRAFT: invoices.filter(i => i.status === 'DRAFT'),
    ISSUED: invoices.filter(i => i.status === 'ISSUED'),
    PAID: invoices.filter(i => i.status === 'PAID'),
    CANCELLED: invoices.filter(i => i.status === 'CANCELLED')
  };

  // 請求書の総額計算
  const totalInvoiceAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  // タブ切り替えハンドラ
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>ダッシュボード</h1>
          <p className="dashboard-subtitle">
            ようこそ、{user?.name || user?.loginId} さん
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <>
            {/* タブナビゲーション */}
            <div className="tabs-container">
              <button
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                基本統計
              </button>
              <button
                className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => handleTabChange('projects')}
              >
                案件ステータス
              </button>
              <button
                className={`tab-button ${activeTab === 'commissions' ? 'active' : ''}`}
                onClick={() => handleTabChange('commissions')}
              >
                手数料ステータス
              </button>
              <button
                className={`tab-button ${activeTab === 'invoices' ? 'active' : ''}`}
                onClick={() => handleTabChange('invoices')}
              >
                請求書ステータス
              </button>
            </div>

            {/* タブコンテンツ */}
            <div className="tab-content">
              {/* 基本統計タブ */}
              {activeTab === 'overview' && (
                <div className="stats-section">
                  <div className="stats-cards">
                    <div className="stat-card stat-partners">
                      <h3>パートナー数</h3>
                      <p className="stat-number">{partners.length}</p>
                      <button
                        className="stat-link"
                        onClick={() => navigate('/partners')}
                      >
                        一覧を見る →
                      </button>
                    </div>
                    <div className="stat-card stat-projects">
                      <h3>総案件数</h3>
                      <p className="stat-number">{projects.length}</p>
                      <button
                        className="stat-link"
                        onClick={() => navigate('/projects')}
                      >
                        一覧を見る →
                      </button>
                    </div>
                    <div className="stat-card stat-commissions">
                      <h3>総手数料</h3>
                      <p className="stat-number">{formatCurrency(totalCommissionAmount)}</p>
                      <button
                        className="stat-link"
                        onClick={() => navigate('/commissions')}
                      >
                        一覧を見る →
                      </button>
                    </div>
                    <div className="stat-card stat-invoices">
                      <h3>総請求金額</h3>
                      <p className="stat-number">{formatCurrency(totalInvoiceAmount)}</p>
                      <button
                        className="stat-link"
                        onClick={() => navigate('/invoices')}
                      >
                        一覧を見る →
                      </button>
                    </div>
                  </div>

                  {/* 最近の案件 */}
                  <div className="recent-projects">
                    <h2>最近の案件</h2>
                    {projects.length === 0 ? (
                      <p className="no-data">案件がありません</p>
                    ) : (
                      <div className="projects-list">
                        {projects.slice(0, 5).map((project) => (
                          <div
                            key={project.id}
                            className="project-item"
                            onClick={() => handleProjectClick(project.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="project-item-header">
                              <h3>{project.name}</h3>
                              <span className={getProjectStatusClass(project.status)}>
                                {getProjectStatusLabel(project.status)}
                              </span>
                            </div>
                            <div className="project-item-details">
                              <p>
                                <strong>パートナー:</strong> {project.partnerName}
                              </p>
                              <p>
                                <strong>担当者:</strong> {project.assignments ? project.assignments.length : 0}名
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 案件ステータスタブ */}
              {activeTab === 'projects' && (
                <div className="stats-section">
                  <div className="stats-cards">
                    <div className="stat-card stat-new">
                      <h3>新規案件</h3>
                      <p className="stat-number">{projectsByStatus.NEW.length}</p>
                      <p className="stat-detail">対応待ち</p>
                    </div>
                    <div className="stat-card stat-progress">
                      <h3>進行中</h3>
                      <p className="stat-number">{projectsByStatus.IN_PROGRESS.length}</p>
                      <p className="stat-detail">作業中</p>
                    </div>
                    <div className="stat-card stat-done">
                      <h3>完了</h3>
                      <p className="stat-number">{projectsByStatus.DONE.length}</p>
                      <p className="stat-detail">終了済み</p>
                    </div>
                  </div>

                  {/* 案件一覧 */}
                  <div className="recent-projects">
                    <h2>案件一覧</h2>
                    {projects.length === 0 ? (
                      <p className="no-data">案件がありません</p>
                    ) : (
                      <div className="projects-list">
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="project-item"
                            onClick={() => handleProjectClick(project.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="project-item-header">
                              <h3>{project.name}</h3>
                              <span className={getProjectStatusClass(project.status)}>
                                {getProjectStatusLabel(project.status)}
                              </span>
                            </div>
                            <div className="project-item-details">
                              <p>
                                <strong>パートナー:</strong> {project.partnerName}
                              </p>
                              <p>
                                <strong>担当者:</strong> {project.assignments ? project.assignments.length : 0}名
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 手数料ステータスタブ */}
              {activeTab === 'commissions' && (
                <div className="stats-section">
                  <div className="stats-cards">
                    <div className="stat-card stat-commission-pending">
                      <h3>未承認</h3>
                      <p className="stat-number">{commissionsByStatus.PENDING.length}件</p>
                      <p className="stat-amount">{formatCurrency(pendingCommissionAmount)}</p>
                    </div>
                    <div className="stat-card stat-commission-approved">
                      <h3>承認済</h3>
                      <p className="stat-number">{commissionsByStatus.APPROVED.length}件</p>
                      <p className="stat-amount">{formatCurrency(approvedCommissionAmount)}</p>
                    </div>
                    <div className="stat-card stat-commission-paid">
                      <h3>支払済</h3>
                      <p className="stat-number">{commissionsByStatus.PAID.length}件</p>
                      <p className="stat-amount">{formatCurrency(paidCommissionAmount)}</p>
                    </div>
                  </div>

                  {/* 詳細情報 */}
                  <div className="info-section">
                    <div className="info-card">
                      <h3>📊 手数料サマリー</h3>
                      <div className="info-details">
                        <div className="info-row">
                          <span>総手数料額:</span>
                          <strong>{formatCurrency(totalCommissionAmount)}</strong>
                        </div>
                        <div className="info-row">
                          <span>総件数:</span>
                          <strong>{commissions.length}件</strong>
                        </div>
                        <div className="info-row">
                          <span>平均手数料:</span>
                          <strong>
                            {commissions.length > 0
                              ? formatCurrency(totalCommissionAmount / commissions.length)
                              : '¥0'}
                          </strong>
                        </div>
                      </div>
                      <button
                        className="info-button"
                        onClick={() => navigate('/commissions')}
                      >
                        手数料管理画面へ
                      </button>
                    </div>
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
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;