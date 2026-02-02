import React, { useState, useEffect } from 'react';
import './Contents.css';

/**
 * コンテンツ管理（ファイル倉庫）画面
 * ファイルのアップロード、管理、プレビュー機能
 */
const Contents = () => {
  // フォルダとファイルのデータ
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);

  // モーダルの表示状態
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // フォームデータ
  const [folderName, setFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // エラーメッセージ
  const [error, setError] = useState('');

  // 初期データ取得
  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentFolder]);

  // フォルダ一覧を取得
  const fetchFolders = async () => {
    // TODO: APIから取得
    // 仮データ
    setFolders([
      { id: '1', name: '製品カタログ', fileCount: 5, createdAt: '2026-01-15' },
      { id: '2', name: '営業資料', fileCount: 8, createdAt: '2026-01-20' },
      { id: '3', name: 'マニュアル', fileCount: 3, createdAt: '2026-01-25' }
    ]);
  };

  // ファイル一覧を取得
  const fetchFiles = async () => {
    // TODO: APIから取得
    // 仮データ
    setFiles([
      {
        id: '1',
        name: '製品Aカタログ_v2.pdf',
        type: 'application/pdf',
        size: 2048576,
        uploadedAt: '2026-02-01',
        uploadedBy: '山田太郎'
      },
      {
        id: '2',
        name: '提案書テンプレート.pptx',
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        size: 1048576,
        uploadedAt: '2026-02-02',
        uploadedBy: '鈴木花子'
      },
      {
        id: '3',
        name: '操作マニュアル_v3.pdf',
        type: 'application/pdf',
        size: 3145728,
        uploadedAt: '2026-01-30',
        uploadedBy: '佐藤次郎'
      }
    ]);
  };

  // フォルダ作成モーダルを開く
  const handleOpenFolderModal = () => {
    setFolderName('');
    setShowFolderModal(true);
  };

  // ファイルアップロードモーダルを開く
  const handleOpenUploadModal = () => {
    setSelectedFiles([]);
    setShowUploadModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowFolderModal(false);
    setShowUploadModal(false);
    setError('');
  };

  // フォルダを作成
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setError('');

    if (!folderName.trim()) {
      setError('フォルダ名を入力してください');
      return;
    }

    try {
      // TODO: フォルダ作成API呼び出し
      console.log('フォルダ作成:', folderName);
      await fetchFolders();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'フォルダの作成に失敗しました');
    }
  };

  // ファイルをアップロード
  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedFiles.length === 0) {
      setError('ファイルを選択してください');
      return;
    }

    try {
      // TODO: ファイルアップロードAPI呼び出し
      console.log('ファイルアップロード:', selectedFiles);
      await fetchFiles();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'ファイルのアップロードに失敗しました');
    }
  };

  // ファイル選択時の処理
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // フォルダをクリックした時
  const handleFolderClick = (folderId) => {
    setCurrentFolder(folderId);
  };

  // ファイルをダウンロード
  const handleDownload = (fileId) => {
    // TODO: ダウンロードAPI呼び出し
    console.log('ダウンロード:', fileId);
  };

  // ファイルを削除
  const handleDelete = async (fileId) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      // TODO: 削除API呼び出し
      console.log('削除:', fileId);
      await fetchFiles();
    } catch (err) {
      setError(err.response?.data?.message || '削除に失敗しました');
    }
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // ファイルタイプからアイコンを取得
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    return '📎';
  };

  return (
    <div className="contents-container">
      <div className="contents-header">
        <h1>ファイル倉庫</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleOpenFolderModal}>
            + フォルダ作成
          </button>
          <button className="btn btn-primary" onClick={handleOpenUploadModal}>
            + ファイルアップロード
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* フォルダ一覧 */}
      <div className="folders-section">
        <h2>フォルダ</h2>
        <div className="folder-grid">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="folder-card"
              onClick={() => handleFolderClick(folder.id)}
            >
              <div className="folder-icon">📁</div>
              <div className="folder-name">{folder.name}</div>
              <div className="folder-info">
                {folder.fileCount}個のファイル
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ファイル一覧 */}
      <div className="files-section">
        <h2>ファイル</h2>
        <div className="file-list">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-icon">{getFileIcon(file.type)}</div>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  {formatFileSize(file.size)} • {file.uploadedAt} • {file.uploadedBy}
                </div>
              </div>
              <div className="file-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => handleDownload(file.id)}
                >
                  ダウンロード
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(file.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フォルダ作成モーダル */}
      {showFolderModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>フォルダ作成</h3>
            <form onSubmit={handleCreateFolder}>
              <div className="form-group">
                <label>フォルダ名 *</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="例: 製品カタログ"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ファイルアップロードモーダル */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ファイルアップロード</h3>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>ファイル選択 *</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  required
                />
                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <p>{selectedFiles.length}個のファイルを選択中:</p>
                    <ul>
                      {selectedFiles.map((file, index) => (
                        <li key={index}>
                          {file.name} ({formatFileSize(file.size)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  アップロード
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contents;