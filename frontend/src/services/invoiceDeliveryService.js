import api from './api';

/**
 * 請求書送付サービス
 * 請求書のメール送信と送付履歴の管理を担当
 */
const invoiceDeliveryService = {
  /**
   * 請求書をメールで送付
   * PDFを生成して指定された宛先にメール送信
   * 
   * @param {Object} deliveryData - 送付データ
   * @param {string} deliveryData.invoiceId - 請求書ID（必須）
   * @param {string} deliveryData.recipientEmail - 宛先メールアドレス（必須）
   * @param {string} deliveryData.senderEmailId - 送信元メールアドレスID（オプション、未指定時はデフォルト使用）
   * @param {string} deliveryData.subject - メール件名（オプション、未指定時は自動生成）
   * @param {string} deliveryData.body - メール本文（オプション、未指定時は自動生成）
   * @param {boolean} deliveryData.attachPdf - PDF添付フラグ（デフォルト: true）
   * @returns {Promise<Object>} 送付履歴レスポンス
   */
  sendInvoice: async (deliveryData) => {
    const response = await api.post('/api/invoice-deliveries/send', deliveryData);
    return response.data;
  },

  /**
   * 指定した請求書の送付履歴を取得
   * 送信日時の降順で返却
   * 
   * @param {string} invoiceId - 請求書ID
   * @returns {Promise<Array>} 送付履歴の配列
   */
  getDeliveriesByInvoice: async (invoiceId) => {
    const response = await api.get(`/api/invoice-deliveries/by-invoice/${invoiceId}`);
    return response.data;
  },

  /**
   * 指定した送信者の送付履歴を取得
   * 送信日時の降順で返却
   * 
   * @param {string} userId - ユーザーID
   * @returns {Promise<Array>} 送付履歴の配列
   */
  getDeliveriesBySender: async (userId) => {
    const response = await api.get(`/api/invoice-deliveries/by-sender/${userId}`);
    return response.data;
  },

  /**
   * 指定したステータスの送付履歴を取得
   * 送信日時の降順で返却
   * 
   * @param {string} status - 送信ステータス（SENT/FAILED/PENDING）
   * @returns {Promise<Array>} 送付履歴の配列
   */
  getDeliveriesByStatus: async (status) => {
    const response = await api.get(`/api/invoice-deliveries/by-status/${status}`);
    return response.data;
  },

  /**
   * 送付履歴をIDで取得
   * 
   * @param {string} id - 送付履歴ID
   * @returns {Promise<Object>} 送付履歴
   */
  getDeliveryById: async (id) => {
    const response = await api.get(`/api/invoice-deliveries/${id}`);
    return response.data;
  },

  // ========================================
  // 送信元メールアドレス管理
  // ========================================

  /**
   * 全ての送信元メールアドレスを取得
   * 作成日時の降順で返却
   * 
   * @returns {Promise<Array>} 送信元メールアドレスの配列
   */
  getAllSenderEmails: async () => {
    const response = await api.get('/api/sender-emails');
    return response.data;
  },

  /**
   * デフォルトの送信元メールアドレスを取得
   * 
   * @returns {Promise<Object>} デフォルトの送信元メールアドレス
   */
  getDefaultSenderEmail: async () => {
    const response = await api.get('/api/sender-emails/default');
    return response.data;
  },

  /**
   * 送信元メールアドレスをIDで取得
   * 
   * @param {string} id - 送信元メールアドレスID
   * @returns {Promise<Object>} 送信元メールアドレス
   */
  getSenderEmailById: async (id) => {
    const response = await api.get(`/api/sender-emails/${id}`);
    return response.data;
  },

  /**
   * 送信元メールアドレスを新規作成
   * 
   * @param {Object} senderEmailData - 送信元メールアドレスデータ
   * @param {string} senderEmailData.email - メールアドレス（必須）
   * @param {string} senderEmailData.displayName - 表示名（必須）
   * @param {boolean} senderEmailData.isDefault - デフォルトフラグ（デフォルト: false）
   * @param {boolean} senderEmailData.isActive - 有効フラグ（デフォルト: true）
   * @returns {Promise<Object>} 作成された送信元メールアドレス
   */
  createSenderEmail: async (senderEmailData) => {
    const response = await api.post('/api/sender-emails', senderEmailData);
    return response.data;
  },

  /**
   * 送信元メールアドレスを更新
   * 
   * @param {string} id - 送信元メールアドレスID
   * @param {Object} senderEmailData - 更新データ
   * @returns {Promise<Object>} 更新された送信元メールアドレス
   */
  updateSenderEmail: async (id, senderEmailData) => {
    const response = await api.put(`/api/sender-emails/${id}`, senderEmailData);
    return response.data;
  },

  /**
   * 送信元メールアドレスを削除
   * 
   * @param {string} id - 送信元メールアドレスID
   * @returns {Promise<void>}
   */
  deleteSenderEmail: async (id) => {
    await api.delete(`/api/sender-emails/${id}`);
  },

  /**
   * デフォルトの送信元メールアドレスを設定
   * 既存のデフォルトは自動的に解除される
   * 
   * @param {string} id - 送信元メールアドレスID
   * @returns {Promise<Object>} 更新された送信元メールアドレス
   */
  setDefaultSenderEmail: async (id) => {
    const response = await api.patch(`/api/sender-emails/${id}/set-default`);
    return response.data;
  },
};

export default invoiceDeliveryService;
