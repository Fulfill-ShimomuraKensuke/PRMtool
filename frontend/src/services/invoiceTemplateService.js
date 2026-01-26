import api from './api';

/**
 * InvoiceTemplateサービス
 * 請求書テンプレートのAPI通信を管理
 */
const invoiceTemplateService = {
  /**
   * 全テンプレートを取得
   * 作成日時の降順で取得
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/invoice-templates');
      return response.data;
    } catch (error) {
      console.error('Get all templates error:', error);
      throw error;
    }
  },

  /**
   * テンプレートIDで取得
   * 特定のテンプレート詳細を取得
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/invoice-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get template by id error:', error);
      throw error;
    }
  },

  /**
   * デフォルトテンプレートを取得
   * システムのデフォルトテンプレートを取得
   */
  getDefault: async () => {
    try {
      const response = await api.get('/api/invoice-templates/default');
      return response.data;
    } catch (error) {
      console.error('Get default template error:', error);
      throw error;
    }
  },

  /**
   * テンプレートを作成
   * 新しいテンプレートを登録
   */
  create: async (templateData) => {
    try {
      const response = await api.post('/api/invoice-templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Create template error:', error);
      throw error;
    }
  },

  /**
   * テンプレートを更新
   * 既存テンプレートの内容を変更
   */
  update: async (id, templateData) => {
    try {
      const response = await api.put(`/api/invoice-templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Update template error:', error);
      throw error;
    }
  },

  /**
   * テンプレートを削除
   * 指定されたテンプレートを削除
   */
  delete: async (id) => {
    try {
      await api.delete(`/api/invoice-templates/${id}`);
    } catch (error) {
      console.error('Delete template error:', error);
      throw error;
    }
  },

  /**
   * デフォルトテンプレートに設定
   * 指定したテンプレートをデフォルトに変更
   */
  setAsDefault: async (id) => {
    try {
      const response = await api.put(`/api/invoice-templates/${id}/set-default`);
      return response.data;
    } catch (error) {
      console.error('Set as default error:', error);
      throw error;
    }
  },

  /**
   * テンプレートのプレビューPDFを取得
   * サンプルデータでレイアウトを確認
   */
  getPreviewPdf: async (id) => {
    try {
      const response = await api.get(`/api/invoice-templates/${id}/preview`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Get preview PDF error:', error);
      throw error;
    }
  }
};

export default invoiceTemplateService;