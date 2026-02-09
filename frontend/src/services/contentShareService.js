import api from './api';

/**
 * コンテンツ共有サービス
 * ファイル共有とアクセス履歴の管理を提供
 */

// ========================================
// 共有管理API
// ========================================

/**
 * 全共有を取得
 */
export const getAllShares = async () => {
  const response = await api.get('/api/content-shares');
  return response.data;
};

/**
 * 共有をIDで取得
 */
export const getShareById = async (shareId) => {
  const response = await api.get(`/api/content-shares/${shareId}`);
  return response.data;
};

/**
 * 指定したファイルの共有を取得
 */
export const getSharesByFile = async (fileId) => {
  const response = await api.get(`/api/content-shares/by-file/${fileId}`);
  return response.data;
};

/**
 * 指定したパートナーとの共有を取得
 */
export const getSharesByPartner = async (partnerId) => {
  const response = await api.get(`/api/content-shares/by-partner/${partnerId}`);
  return response.data;
};

/**
 * 有効な共有のみ取得
 */
export const getActiveShares = async () => {
  const response = await api.get('/api/content-shares/active');
  return response.data;
};

/**
 * 共有を作成
 */
export const createShare = async (shareData) => {
  const response = await api.post('/api/content-shares', shareData);
  return response.data;
};

/**
 * 共有を更新
 */
export const updateShare = async (shareId, shareData) => {
  const response = await api.put(`/api/content-shares/${shareId}`, shareData);
  return response.data;
};

/**
 * 共有を無効化
 */
export const revokeShare = async (shareId) => {
  const response = await api.patch(`/api/content-shares/${shareId}/revoke`);
  return response.data;
};

/**
 * 共有ファイルへのアクセスを記録
 */
export const recordAccess = async (shareId, accessType, ipAddress = null) => {
  const params = {
    accessType: accessType,
  };
  if (ipAddress) {
    params.ipAddress = ipAddress;
  }
  await api.post(`/api/content-shares/${shareId}/access`, null, { params });
};

/**
 * 共有のアクセス履歴を取得
 */
export const getAccessHistory = async (shareId) => {
  const response = await api.get(`/api/content-shares/${shareId}/access-history`);
  return response.data;
};

// ========================================
// ユーティリティ関数
// ========================================

/**
 * 共有ステータスのラベルを取得
 */
export const getStatusLabel = (status) => {
  const statusLabels = {
    ACTIVE: '有効',
    EXPIRED: '期限切れ',
    REVOKED: '無効化',
    EXHAUSTED: '回数制限到達',
  };
  return statusLabels[status] || status;
};

/**
 * 共有ステータスのバッジクラスを取得
 */
export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    ACTIVE: 'badge-success',
    EXPIRED: 'badge-warning',
    REVOKED: 'badge-danger',
    EXHAUSTED: 'badge-secondary',
  };
  return statusClasses[status] || 'badge-secondary';
};

/**
 * 日付を表示用フォーマットに変換
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';

  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 日付を表示用フォーマットに変換（日付のみ）
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * 共有対象タイプのラベルを取得
 */
export const getShareTargetLabel = (shareTarget) => {
  const labels = {
    SPECIFIC_PARTNER: '特定のパートナー',
    ALL_PARTNERS: '全パートナー',
  };
  return labels[shareTarget] || shareTarget;
};

/**
 * 共有方法のラベルを取得
 */
export const getShareMethodLabel = (shareMethod) => {
  const labels = {
    SYSTEM_LINK: 'システム内リンク',
    EMAIL_LINK: 'メールでリンク送付',
    EMAIL_ATTACH: 'メールで添付',
  };
  return labels[shareMethod] || shareMethod;
};

/**
 * 有効期限が切れているかチェック
 */
export const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

/**
 * ダウンロード制限に達しているかチェック
 */
export const isExhausted = (currentCount, limit) => {
  if (!limit) return false;
  return currentCount >= limit;
};

/**
 * 共有が有効かチェック
 */
export const isShareValid = (share) => {
  if (share.status !== 'ACTIVE') return false;
  if (isExpired(share.expiresAt)) return false;
  if (isExhausted(share.currentDownloadCount, share.downloadLimit)) return false;
  return true;
};

const contentShareService = {
  // 共有管理
  getAllShares,
  getShareById,
  getSharesByFile,
  getSharesByPartner,
  getActiveShares,
  createShare,
  updateShare,
  revokeShare,
  recordAccess,
  getAccessHistory,
  // ユーティリティ
  getStatusLabel,
  getStatusBadgeClass,
  formatDateTime,
  formatDate,
  getShareTargetLabel,
  getShareMethodLabel,
  isExpired,
  isExhausted,
  isShareValid,
};

export default contentShareService;