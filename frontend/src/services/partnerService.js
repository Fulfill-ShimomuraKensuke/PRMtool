import api from './api';

const partnerService = {
  // 全パートナー取得
  getAll: async () => {
    try {
      const response = await api.get('/api/partners');
      return response.data;
    } catch (error) {
      console.error('Get all partners error:', error);
      throw error;
    }
  },

  // パートナー詳細取得
  getById: async (id) => {
    try {
      const response = await api.get(`/api/partners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get partner by id error:', error);
      throw error;
    }
  },

  // パートナー作成
  create: async (partnerData) => {
    try {
      const response = await api.post('/api/partners', partnerData);
      return response.data;
    } catch (error) {
      console.error('Create partner error:', error);
      throw error;
    }
  },

  // パートナー更新
  update: async (id, partnerData) => {
    try {
      const response = await api.put(`/api/partners/${id}`, partnerData);
      return response.data;
    } catch (error) {
      console.error('Update partner error:', error);
      throw error;
    }
  },

  // パートナー削除
  delete: async (id) => {
    try {
      await api.delete(`/api/partners/${id}`);
    } catch (error) {
      console.error('Delete partner error:', error);
      throw error;
    }
  },

  // 🆕 CSVインポート
  importCsv: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/partners/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Import CSV error:', error);
      throw error;
    }
  },
};

export default partnerService;