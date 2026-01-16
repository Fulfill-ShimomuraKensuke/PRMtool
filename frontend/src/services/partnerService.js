import api from './api';

const partnerService = {
  getAll: async () => {
    const response = await api.get('/api/partners');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/partners/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/partners', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/partners/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/partners/${id}`);
  },

  // パートナー別ダッシュボードを取得
  getDashboard: async (partnerId) => {
    try {
      const response = await api.get(`/api/partners/${partnerId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Get partner dashboard error:', error);
      throw error;
    }
  },

  importCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/partners/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default partnerService;