import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import partnerService from '../services/partnerService';
import './PartnerDashboard.css';

/**
 * パートナー別ダッシュボード
 * 新設計対応版（実績ベース統計）
 */
const PartnerDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await partnerService.getDashboard(id);
      setDashboard(data);
      document.title = `${data.partnerName} - ダッシュボード - PRM Tool`;
    } catch (err) {
      setError('ダッシュボードの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // 金額をフォーマット
  const formatCurrency = (amount) => {
    if (!amount) return '¥0';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/partners')} className="btn-primary">
          パートナー一覧に戻る
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="partner-dashboard-container">
      {/* ヘッダー */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{dashboard.partnerName}</h1>
          <p className="industry-label">業種: {dashboard.industry}</p>
        </div>
        <button onClick={() => navigate('/partners')} className="btn-back">
          ← 一覧に戻る
        </button>
      </div>

      {/* 統計カード */}
      <div className="stats-grid">
        {/* 案件統計 */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-project">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">総案件数</p>
            <p className="stat-value">{dashboard.totalProjects}</p>
            <p className="stat-detail">
              進行中: {dashboard.activeProjects} / 完了: {dashboard.completedProjects}
            </p>
          </div>
        </div>

        {/* 手数料統計（実績ベース） */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-commission">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">総手数料（実績）</p>
            <p className="stat-value">{formatCurrency(dashboard.totalCommission)}</p>
            <p className="stat-detail">
              発行済: {formatCurrency(dashboard.issuedCommission)}
            </p>
          </div>
        </div>

        {/* 手数料ルール統計（契約ベース） */}
        {dashboard.totalCommissionRules !== undefined && (
          <div className="stat-card">
            <div className="stat-icon stat-icon-rule">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">手数料ルール数</p>
              <p className="stat-value">{dashboard.totalCommissionRules}</p>
              <p className="stat-detail">
                確定済: {dashboard.confirmedRules}
              </p>
            </div>
          </div>
        )}

        {/* 請求書統計 */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-invoice">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">総請求書数</p>
            <p className="stat-value">{dashboard.totalInvoices}</p>
            <p className="stat-detail">
              発行済: {dashboard.issuedInvoices} / 支払済: {dashboard.paidInvoices}
            </p>
          </div>
        </div>

        {/* 請求金額統計 */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-amount">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">総請求金額</p>
            <p className="stat-value">{formatCurrency(dashboard.totalInvoiceAmount)}</p>
            <p className="stat-detail">税込</p>
          </div>
        </div>
      </div>

      {/* 詳細セクション */}
      <div className="details-grid">
        {/* 手数料ステータス別内訳（実績ベース） */}
        {dashboard.commissionByInvoiceStatus && (
          <div className="detail-card">
            <h3>手数料ステータス別（実績）</h3>
            <div className="detail-list">
              {Object.entries(dashboard.commissionByInvoiceStatus).map(([status, amount]) => (
                <div key={status} className="detail-item">
                  <span className="detail-label">{status}</span>
                  <span className="detail-value">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 旧形式との互換性（commissionByStatus がある場合） */}
        {dashboard.commissionByStatus && !dashboard.commissionByInvoiceStatus && (
          <div className="detail-card">
            <h3>手数料ステータス別</h3>
            <div className="detail-list">
              {Object.entries(dashboard.commissionByStatus).map(([status, amount]) => (
                <div key={status} className="detail-item">
                  <span className="detail-label">{status}</span>
                  <span className="detail-value">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 請求書ステータス別内訳 */}
        <div className="detail-card">
          <h3>請求書ステータス別</h3>
          <div className="detail-list">
            {Object.entries(dashboard.invoiceCountByStatus).map(([status, count]) => (
              <div key={status} className="detail-item">
                <span className="detail-label">{status}</span>
                <span className="detail-value">{count}件</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="action-buttons">
        <button onClick={() => navigate(`/partners/${id}`)} className="btn-action">
          パートナー詳細を見る
        </button>
        <button onClick={() => navigate(`/commission-rules`)} className="btn-action">
          手数料ルール一覧を見る
        </button>
        <button onClick={() => navigate(`/invoices`)} className="btn-action">
          請求書一覧を見る
        </button>
      </div>
    </div>
  );
};

export default PartnerDashboard;