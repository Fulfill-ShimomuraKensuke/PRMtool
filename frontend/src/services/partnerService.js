import api from './api';

const partnerService = {
  // パートナー一覧取得
  getAll: async (ownerId = null) => {
    try {
      const url = '/api/partners';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get all partners error:', error);
      throw error;
    }
  },

  // パートナー詳細取得
  getById: async (id) => {
    const response = await api.get(`/api/partners/${id}`);
    return response.data;
  },

  // パートナー登録
  create: async (partnerData) => {
    const response = await api.post('/api/partners', partnerData);
    return response.data;
  },

  // パートナー更新
  update: async (id, partnerData) => {
    const response = await api.put(`/api/partners/${id}`, partnerData);
    return response.data;
  },

  // パートナー削除
  delete: async (id) => {
    await api.delete(`/api/partners/${id}`);
  },
};

export default partnerService;