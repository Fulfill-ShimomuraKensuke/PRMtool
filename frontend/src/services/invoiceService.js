import api from './api';

// 請求書管理のAPIサービス
const invoiceService = {
  // 請求書一覧を取得
  getAll: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },

  // 請求書IDで取得
  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // パートナーIDで請求書を取得
  getByPartnerId: async (partnerId) => {
    const response = await api.get(`/invoices/partner/${partnerId}`);
    return response.data;
  },

  // ステータスで請求書を取得
  getByStatus: async (status) => {
    const response = await api.get(`/invoices/status/${status}`);
    return response.data;
  },

  // 請求書を作成
  create: async (data) => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  // 請求書を更新
  update: async (id, data) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  // 請求書を削除
  delete: async (id) => {
    await api.delete(`/invoices/${id}`);
  },

  // パートナーIDで請求書の合計金額を取得
  getTotalByPartnerId: async (partnerId) => {
    const response = await api.get(`/invoices/partner/${partnerId}/total`);
    return response.data;
  },
};

export default invoiceService;
