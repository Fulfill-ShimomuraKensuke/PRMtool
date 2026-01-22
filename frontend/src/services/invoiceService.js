import api from './api';

/**
 * 請求書管理のAPIサービス
 * 請求書の作成、更新、削除、状態変更を管理
 */
const invoiceService = {
  // 請求書一覧を取得
  getAll: async () => {
    const response = await api.get('/api/invoices');
    return response.data;
  },

  // 請求書IDで取得
  getById: async (id) => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data;
  },

  // パートナーIDで請求書を取得
  getByPartnerId: async (partnerId) => {
    const response = await api.get(`/api/invoices/by-partner/${partnerId}`);
    return response.data;
  },

  // ステータスで請求書を取得
  getByStatus: async (status) => {
    const response = await api.get(`/api/invoices/status/${status}`);
    return response.data;
  },

  // 請求書を作成
  create: async (data) => {
    const response = await api.post('/api/invoices', data);
    return response.data;
  },

  // 請求書を更新
  update: async (id, data) => {
    const response = await api.put(`/api/invoices/${id}`, data);
    return response.data;
  },

  // 請求書を削除
  delete: async (id) => {
    await api.delete(`/api/invoices/${id}`);
  },

  /**
   * 請求書を「支払済」に変更する専用メソッド
   * 発行済(ISSUED)状態の請求書のみ支払済(PAID)に変更可能
   * @param {string} id - 請求書ID
   * @returns {Promise} 更新後の請求書データ
   */
  markAsPaid: async (id) => {
    const response = await api.patch(`/api/invoices/${id}/mark-as-paid`);
    return response.data;
  },

  // パートナーIDで請求書の合計金額を取得
  getTotalByPartnerId: async (partnerId) => {
    const response = await api.get(`/api/invoices/partner/${partnerId}/total`);
    return response.data;
  },
};

export default invoiceService;