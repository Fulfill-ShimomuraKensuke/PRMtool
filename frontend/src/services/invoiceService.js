import api from './api';

/**
 * Invoiceサービス
 * 請求書のAPI通信を管理
 */
const invoiceService = {
  /**
   * 全請求書を取得
   */
  getAll: async () => {
    const response = await api.get('/api/invoices');
    return response.data;
  },

  /**
   * IDで請求書を取得
   */
  getById: async (id) => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data;
  },

  /**
   * パートナーIDで請求書を取得
   */
  getByPartnerId: async (partnerId) => {
    const response = await api.get(`/api/invoices/by-partner/${partnerId}`);
    return response.data;
  },

  /**
   * 請求書を作成
   */
  create: async (data) => {
    const response = await api.post('/api/invoices', data);
    return response.data;
  },

  /**
   * 請求書を更新
   */
  update: async (id, data) => {
    const response = await api.put(`/api/invoices/${id}`, data);
    return response.data;
  },

  /**
   * 請求書を削除
   */
  delete: async (id) => {
    await api.delete(`/api/invoices/${id}`);
  },

  /**
   * ステータスを更新
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/invoices/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  /**
   * 請求書を「支払済」に変更
   */
  markAsPaid: async (id) => {
    const response = await api.patch(`/api/invoices/${id}/mark-as-paid`);
    return response.data;
  },

  /**
   * 請求書PDFを生成してダウンロード
   * 
   * パラメータ:
   * - id: 請求書ID
   * - templateId: 使用するテンプレートID（オプション）
   * 
   * 戻り値:
   * - PDFのBlobオブジェクト
   */
  downloadPdf: async (id, templateId = null) => {
    const params = templateId ? { templateId } : {};

    const response = await api.get(`/api/invoices/${id}/pdf`, {
      params,
      responseType: 'blob'
    });

    return response.data;
  },

  /**
   * 請求書PDFをダウンロード（ファイル保存ダイアログを表示）
   * 
   * パラメータ:
   * - id: 請求書ID
   * - invoiceNumber: 請求書番号（ファイル名に使用）
   * - templateId: 使用するテンプレートID（オプション）
   */
  downloadPdfFile: async (id, invoiceNumber, templateId = null) => {
    try {
      const blob = await invoiceService.downloadPdf(id, templateId);

      // BlobからダウンロードURLを作成
      const url = window.URL.createObjectURL(blob);

      // ダウンロードリンクを作成してクリック
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();

      // クリーンアップ
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDFダウンロードエラー:', error);
      throw error;
    }
  }
};

export default invoiceService;