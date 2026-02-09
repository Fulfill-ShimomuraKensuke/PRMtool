import api from './api';

/**
 * コンテンツ管理サービス
 * フォルダとファイルの操作を提供
 */

// ========================================
// フォルダ管理API
// ========================================

/**
 * 全フォルダを取得
 */
export const getAllFolders = async () => {
  const response = await api.get('/api/contents/folders');
  return response.data;
};

/**
 * ルートフォルダを取得
 */
export const getRootFolders = async () => {
  const response = await api.get('/api/contents/folders/root');
  return response.data;
};

/**
 * 指定したフォルダの子フォルダを取得
 */
export const getSubFolders = async (parentFolderId) => {
  const response = await api.get(`/api/contents/folders/${parentFolderId}/sub-folders`);
  return response.data;
};

/**
 * フォルダをIDで取得
 */
export const getFolderById = async (folderId) => {
  const response = await api.get(`/api/contents/folders/${folderId}`);
  return response.data;
};

/**
 * フォルダを作成
 */
export const createFolder = async (folderData) => {
  const response = await api.post('/api/contents/folders', folderData);
  return response.data;
};

/**
 * フォルダを更新
 */
export const updateFolder = async (folderId, folderData) => {
  const response = await api.put(`/api/contents/folders/${folderId}`, folderData);
  return response.data;
};

/**
 * フォルダを削除
 */
export const deleteFolder = async (folderId) => {
  await api.delete(`/api/contents/folders/${folderId}`);
};

// ========================================
// ファイル管理API
// ========================================

/**
 * 全ファイルを取得
 */
export const getAllFiles = async () => {
  const response = await api.get('/api/contents/files');
  return response.data;
};

/**
 * 指定したフォルダ内のファイルを取得
 */
export const getFilesByFolder = async (folderId) => {
  const response = await api.get(`/api/contents/folders/${folderId}/files`);
  return response.data;
};

/**
 * ファイルをIDで取得
 */
export const getFileById = async (fileId) => {
  const response = await api.get(`/api/contents/files/${fileId}`);
  return response.data;
};

/**
 * ファイルをアップロード
 * multipart/form-data形式で送信
 */
export const uploadFile = async (fileData) => {
  const formData = new FormData();
  
  // ファイルを追加
  formData.append('file', fileData.file);
  
  // フォルダIDを追加（必須）
  formData.append('folderId', fileData.folderId);
  
  // オプション項目を追加
  if (fileData.title) {
    formData.append('title', fileData.title);
  }
  if (fileData.description) {
    formData.append('description', fileData.description);
  }
  if (fileData.tags) {
    formData.append('tags', fileData.tags);
  }

  const response = await api.post('/api/contents/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 複数ファイルをアップロード
 */
export const uploadMultipleFiles = async (filesData) => {
  const uploadPromises = filesData.files.map((file) => {
    return uploadFile({
      file: file,
      folderId: filesData.folderId,
      title: filesData.title,
      description: filesData.description,
      tags: filesData.tags,
    });
  });
  
  return await Promise.all(uploadPromises);
};

/**
 * ファイル情報を更新
 */
export const updateFile = async (fileId, fileData) => {
  const response = await api.put(`/api/contents/files/${fileId}`, fileData);
  return response.data;
};

/**
 * ファイルを削除
 */
export const deleteFile = async (fileId) => {
  await api.delete(`/api/contents/files/${fileId}`);
};

/**
 * ファイルをダウンロード
 * ブラウザでファイルをダウンロード
 */
export const downloadFile = async (fileId, fileName) => {
  const response = await api.get(`/api/contents/files/${fileId}/download`, {
    responseType: 'blob',
  });

  // BlobからダウンロードURLを作成
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * ファイルダウンロード記録（ダウンロード自体は別途実行）
 */
export const recordDownload = async (fileId, ipAddress = null) => {
  const params = {};
  if (ipAddress) {
    params.ipAddress = ipAddress;
  }
  await api.post(`/api/contents/files/${fileId}/download-record`, null, { params });
};

/**
 * ファイルサイズを人間が読める形式に変換
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * ファイルタイプに応じたアイコンを取得
 */
export const getFileIcon = (fileType) => {
  if (!fileType) return '📄';
  
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) return '📕';
  if (type.includes('word') || type.includes('document')) return '📘';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📗';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📙';
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return '🖼️';
  if (type.includes('video')) return '🎥';
  if (type.includes('audio')) return '🎵';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦';
  if (type.includes('text')) return '📝';
  
  return '📄';
};

const contentService = {
  // フォルダ管理
  getAllFolders,
  getRootFolders,
  getSubFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  // ファイル管理
  getAllFiles,
  getFilesByFolder,
  getFileById,
  uploadFile,
  uploadMultipleFiles,
  updateFile,
  deleteFile,
  downloadFile,
  recordDownload,
  // ユーティリティ
  formatFileSize,
  getFileIcon,
};

export default contentService;