import api from './api';

const projectService = {
  // 全案件取得（管理者も担当者も全件表示）
  getAll: async (ownerId = null) => {
    try {
      // ownerIdが明示的に指定された場合のみフィルター
      // 現在の要件では常に全件取得
      const url = '/api/projects';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get all projects error:', error);
      throw error;
    }
  },

  // 担当者別案件取得（将来の機能拡張用）
  getByOwner: async (ownerId) => {
    try {
      const response = await api.get(`/api/projects?ownerId=${ownerId}`);
      return response.data;
    } catch (error) {
      console.error('Get projects by owner error:', error);
      throw error;
    }
  },

  // 案件詳細取得
  getById: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get project by id error:', error);
      throw error;
    }
  },

  // 案件作成
  create: async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  // 案件更新
  update: async (id, projectData) => {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  },

  // 案件削除
  delete: async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  },

  // CSVインポート
  importCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/projects/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default projectService;