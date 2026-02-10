import React, { useState, useEffect } from 'react';
import './Contents.css';
import contentService from '../services/contentService';

/**
 * コンテンツ管理画面
 * フォルダ階層とファイルの管理を提供
 */
const Contents = () => {
  // フォルダリスト
  const [folders, setFolders] = useState([]);

  // ファイルリスト
  const [files, setFiles] = useState([]);

  // 現在選択されているフォルダ
  const [selectedFolder, setSelectedFolder] = useState(null);

  // 現在選択中のフォルダーのサブフォルダー（1階層下）
  const [subFolders, setSubFolders] = useState([]);

  // お気に入りフォルダー一覧
  const [favoriteFolders, setFavoriteFolders] = useState([]);

  // パンくずリスト（フォルダー階層）
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'ホーム' }]);

  // モーダルの表示状態
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // フォルダ作成フォーム
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');

  // ファイルアップロード
  const [selectedFiles, setSelectedFiles] = useState([]);

  // エラーメッセージ
  const [error, setError] = useState('');

  // ローディング状態
  const [loading, setLoading] = useState(false);

  // 初期データ取得
  useEffect(() => {
    fetchRootFolders();
    fetchAllFiles();
    fetchFavoriteFolders();
  }, []);

  // ルートフォルダを取得
  const fetchRootFolders = async () => {
    try {
      setLoading(true);
      const data = await contentService.getRootFolders();
      setFolders(data);
    } catch (err) {
      setError('フォルダの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 全ファイルを取得
  const fetchAllFiles = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllFiles();
      setFiles(data);
    } catch (err) {
      setError('ファイルの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // お気に入りフォルダーを取得
  const fetchFavoriteFolders = async () => {
    try {
      const data = await contentService.getFavoriteFolders();
      setFavoriteFolders(data);
    } catch (err) {
      console.error('お気に入りフォルダーの取得に失敗しました', err);
    }
  };

  // フォルダをクリックした時の処理
  // そのフォルダー内のファイルとサブフォルダーを取得
  const handleFolderClick = async (folder) => {
    setSelectedFolder(folder);
    setLoading(true);

    // パンくずリストを更新
    // 現在は1階層のみ表示（APIに親フォルダー情報がないため）
    setBreadcrumbs([
      { id: null, name: 'ホーム' },
      { id: folder.id, name: folder.folderName }
    ]);

    try {
      // ファイル一覧を取得
      const filesData = await contentService.getFilesByFolder(folder.id);
      setFiles(filesData);

      // サブフォルダー一覧を取得
      const subFoldersData = await contentService.getSubFolders(folder.id);
      setSubFolders(subFoldersData);

      setError('');
    } catch (err) {
      setError('ファイルの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 全ファイルボタンをクリック
  const handleShowAllFiles = () => {
    setSelectedFolder(null);
    setSubFolders([]);
    setBreadcrumbs([{ id: null, name: 'ホーム' }]);
    fetchAllFiles();
  };

  // フォルダ作成モーダルを開く
  const handleOpenFolderModal = () => {
    setFolderName('');
    setFolderDescription('');
    setError('');
    setShowFolderModal(true);
  };

  // アップロードモーダルを開く
  const handleOpenUploadModal = () => {
    setSelectedFiles([]);
    setError('');
    setShowUploadModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowFolderModal(false);
    setShowUploadModal(false);
    setError('');
  };

  // フォルダ作成
  const handleCreateFolder = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const folderData = {
        folderName: folderName,
        description: folderDescription,
        parentFolderId: selectedFolder ? selectedFolder.id : null,
      };

      await contentService.createFolder(folderData);

      // フォルダリストを再取得
      if (selectedFolder) {
        const data = await contentService.getSubFolders(selectedFolder.id);
        setFolders(data);
      } else {
        await fetchRootFolders();
      }

      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'フォルダの作成に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ファイル選択
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // ファイルアップロード
  const handleUpload = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError('ファイルを選択してください');
      return;
    }

    if (!selectedFolder) {
      setError('アップロード先のフォルダを選択してください');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 複数ファイルをアップロード
      await contentService.uploadMultipleFiles({
        files: selectedFiles,
        folderId: selectedFolder.id,
      });

      // ファイルリストを再取得
      const data = await contentService.getFilesByFolder(selectedFolder.id);
      setFiles(data);

      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'ファイルのアップロードに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ファイルダウンロード
  const handleDownload = async (file) => {
    try {
      await contentService.downloadFile(file.id, file.fileName);
    } catch (err) {
      setError('ファイルのダウンロードに失敗しました');
      console.error(err);
    }
  };

  // ファイル削除
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('このファイルを削除してもよろしいですか？')) {
      return;
    }

    try {
      setLoading(true);
      await contentService.deleteFile(fileId);

      // ファイルリストを再取得
      if (selectedFolder) {
        const data = await contentService.getFilesByFolder(selectedFolder.id);
        setFiles(data);
      } else {
        await fetchAllFiles();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ファイルの削除に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // フォルダ削除
  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('このフォルダを削除してもよろしいですか？\n※フォルダ内にファイルがある場合は削除できません')) {
      return;
    }

    try {
      setLoading(true);
      await contentService.deleteFolder(folderId);

      // フォルダリストを再取得
      await fetchRootFolders();

      // 削除したフォルダが選択中だった場合はクリア
      if (selectedFolder && selectedFolder.id === folderId) {
        setSelectedFolder(null);
        await fetchAllFiles();
      }

      // サブフォルダーリストも再取得
      if (selectedFolder) {
        const subFoldersData = await contentService.getSubFolders(selectedFolder.id);
        setSubFolders(subFoldersData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'フォルダの削除に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // サブフォルダーをクリックした時の処理
  // そのサブフォルダーに移動する
  const handleSubFolderClick = async (subFolder) => {
    await handleFolderClick(subFolder);
  };

  // お気に入り登録/解除
  const handleToggleFavorite = async (folder) => {
    try {
      setLoading(true);

      if (folder.isFavorite) {
        // お気に入りから削除
        await contentService.removeFavoriteFolder(folder.id);
      } else {
        // お気に入りに追加
        // 最大10個チェック
        if (favoriteFolders.length >= 10) {
          setError('お気に入りフォルダーは最大10個までです');
          setLoading(false);
          return;
        }
        await contentService.addFavoriteFolder(folder.id);
      }

      // お気に入りリストを再取得
      await fetchFavoriteFolders();

      // 現在のフォルダーリストも再取得（isFavoriteフラグ更新のため）
      if (selectedFolder) {
        const subFoldersData = await contentService.getSubFolders(selectedFolder.id);
        setSubFolders(subFoldersData);
      } else {
        await fetchRootFolders();
      }

      // 選択中のフォルダーのisFavoriteフラグも更新
      if (selectedFolder && selectedFolder.id === folder.id) {
        setSelectedFolder({ ...selectedFolder, isFavorite: !folder.isFavorite });
      }

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'お気に入りの更新に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // パンくずリストのクリックハンドラー
  const handleBreadcrumbClick = (crumb) => {
    if (crumb.id === null) {
      // ホームをクリック
      handleShowAllFiles();
    } else {
      // 特定のフォルダーをクリック（現在は機能しない）
      // 理由: APIに親フォルダー情報が含まれていないため、階層を遡れない
    }
  };

  return (
    <div className="contents-container">
      {/* ヘッダー */}
      <div className="contents-header">
        <h1>コンテンツ管理</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleOpenFolderModal}>
            フォルダ作成
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOpenUploadModal}
            disabled={!selectedFolder}
          >
            ファイルアップロード
          </button>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && <div className="error-message">{error}</div>}

      {/* ローディング */}
      {loading && <div className="loading">読み込み中...</div>}

      <div className="contents-body">
        {/* フォルダツリー */}
        <div className="folder-tree">
          <h2>フォルダ</h2>
          <div className="folder-list">
            <div
              className={`folder-item ${!selectedFolder ? 'active' : ''}`}
              onClick={handleShowAllFiles}
            >
              📁 すべてのファイル
            </div>
            {folders.map((folder) => (
              <div key={folder.id} className="folder-item-container">
                <div
                  className={`folder-item ${selectedFolder?.id === folder.id ? 'active' : ''}`}
                  onClick={() => handleFolderClick(folder)}
                >
                  📂 {folder.folderName}
                  {folder.fileCount > 0 && (
                    <span className="file-count">({folder.fileCount})</span>
                  )}
                </div>
                <button
                  className="btn-icon btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            ))}

            {/* お気に入りフォルダーセクション */}
            {favoriteFolders.length > 0 && (
              <>
                <div className="folder-section-divider"></div>
                <h3 className="folder-section-title">⭐ お気に入り</h3>
                {favoriteFolders.map((folder) => (
                  <div key={folder.id} className="folder-item-container">
                    <div
                      className={`folder-item ${selectedFolder?.id === folder.id ? 'active' : ''}`}
                      onClick={() => handleFolderClick(folder)}
                    >
                      📂 {folder.folderName}
                      {folder.fileCount > 0 && (
                        <span className="file-count">({folder.fileCount})</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ファイル一覧 */}
        <div className="files-section">
          {/* パンくずリスト */}
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id || 'home'}>
                {index > 0 && <span className="breadcrumb-separator">›</span>}
                <span
                  className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'current' : ''
                    }`}
                  onClick={() => index < breadcrumbs.length - 1 && handleBreadcrumbClick(crumb)}
                >
                  {crumb.name}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="files-header">
            <h2>
              {selectedFolder ? `${selectedFolder.folderName}のファイル` : 'すべてのファイル'}
            </h2>

            {/* お気に入りボタン */}
            {selectedFolder && (
              <button
                className={`btn-favorite ${selectedFolder.isFavorite ? 'active' : ''}`}
                onClick={() => handleToggleFavorite(selectedFolder)}
                title={selectedFolder.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                {selectedFolder.isFavorite ? '⭐ お気に入り解除' : '☆ お気に入りに追加'}
              </button>
            )}
          </div>

          {/* サブフォルダー表示エリア */}
          {selectedFolder && subFolders.length > 0 && (
            <div className="sub-folders-section">
              <h3>📂 サブフォルダー</h3>
              <div className="sub-folder-grid">
                {subFolders.map((subFolder) => (
                  <div key={subFolder.id} className="sub-folder-card">
                    <div
                      className="sub-folder-info"
                      onClick={() => handleSubFolderClick(subFolder)}
                    >
                      <div className="sub-folder-icon">📂</div>
                      <div className="sub-folder-details">
                        <h4>{subFolder.folderName}</h4>
                        {subFolder.description && (
                          <p className="sub-folder-description">{subFolder.description}</p>
                        )}
                        <span className="file-count">{subFolder.fileCount} ファイル</span>
                      </div>
                    </div>
                    <button
                      className="btn-icon btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(subFolder.id);
                      }}
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length === 0 ? (
            <div className="empty-state">
              <p>ファイルがありません</p>
            </div>
          ) : (
            <div className="file-list">
              {files.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-icon">
                    {contentService.getFileIcon(file.fileType)}
                  </div>
                  <div className="file-details">
                    <div className="file-name">{file.fileName}</div>
                    <div className="file-meta">
                      {contentService.formatFileSize(file.fileSize)} •
                      {new Date(file.uploadedAt).toLocaleDateString('ja-JP')} •
                      {file.uploadedBy}
                    </div>
                    {file.description && (
                      <div className="file-description">{file.description}</div>
                    )}
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn btn-sm"
                      onClick={() => handleDownload(file)}
                    >
                      ダウンロード
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

              <div className="form-group">
                <label>説明</label>
                <textarea
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  placeholder="フォルダの説明を入力してください"
                  rows="3"
                />
              </div>

              {selectedFolder && (
                <div className="info-message">
                  作成先: {selectedFolder.folderName}
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '作成中...' : '作成'}
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
                          {file.name} ({contentService.formatFileSize(file.size)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {selectedFolder && (
                <div className="info-message">
                  アップロード先: {selectedFolder.folderName}
                </div>
              )}

              {!selectedFolder && (
                <div className="warning-message">
                  ⚠️ フォルダを選択してください
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'アップロード中...' : 'アップロード'}
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