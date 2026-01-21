import api from './api';

/**
 * 手数料ルール管理のAPIサービス
 * 新設計: /api/commission-rules
 */
const commissionRuleService = {
  // 手数料ルール一覧を取得
  getAll: async () => {
    const response = await api.get('/api/commission-rules');
    return response.data;
  },

  // 手数料ルールIDで取得
  getById: async (id) => {
    const response = await api.get(`/api/commission-rules/${id}`);
    return response.data;
  },

  // 案件IDで手数料ルールを取得
  getByProjectId: async (projectId) => {
    const response = await api.get(`/api/commission-rules/by-project/${projectId}`);
    return response.data;
  },

  // 請求書で使用可能な手数料ルールを取得（確定状態のみ）
  getUsableByProjectId: async (projectId) => {
    const response = await api.get(`/api/commission-rules/usable/by-project/${projectId}`);
    return response.data;
  },

  // 手数料ルールを作成
  create: async (data) => {
    const response = await api.post('/api/commission-rules', data);
    return response.data;
  },

  // 手数料ルールを更新
  update: async (id, data) => {
    const response = await api.put(`/api/commission-rules/${id}`, data);
    return response.data;
  },

  // ステータスを変更
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/commission-rules/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // 手数料ルールを削除
  delete: async (id) => {
    await api.delete(`/api/commission-rules/${id}`);
  },
};

export default commissionRuleService;