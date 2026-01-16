import api from './api';

// 手数料管理のAPIサービス
const commissionService = {
  // 手数料一覧を取得
  getAll: async () => {
    const response = await api.get('/commissions');
    return response.data;
  },

  // 手数料IDで取得
  getById: async (id) => {
    const response = await api.get(`/commissions/${id}`);
    return response.data;
  },

  // 案件IDで手数料を取得
  getByProjectId: async (projectId) => {
    const response = await api.get(`/commissions/project/${projectId}`);
    return response.data;
  },

  // パートナーIDで手数料を取得
  getByPartnerId: async (partnerId) => {
    const response = await api.get(`/commissions/partner/${partnerId}`);
    return response.data;
  },

  // ステータスで手数料を取得
  getByStatus: async (status) => {
    const response = await api.get(`/commissions/status/${status}`);
    return response.data;
  },

  // 手数料を作成
  create: async (data) => {
    const response = await api.post('/commissions', data);
    return response.data;
  },

  // 手数料を更新
  update: async (id, data) => {
    const response = await api.put(`/commissions/${id}`, data);
    return response.data;
  },

  // 手数料を削除
  delete: async (id) => {
    await api.delete(`/commissions/${id}`);
  },

  // パートナーIDで手数料の合計金額を取得
  getTotalByPartnerId: async (partnerId) => {
    const response = await api.get(`/commissions/partner/${partnerId}/total`);
    return response.data;
  },

  // パートナーIDとステータスで手数料の合計金額を取得
  getTotalByPartnerIdAndStatus: async (partnerId, status) => {
    const response = await api.get(`/commissions/partner/${partnerId}/total/${status}`);
    return response.data;
  },
};

export default commissionService;
