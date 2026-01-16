import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import './Accounts.css';

// アカウント管理ページコンポーネント
const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    loginId: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    role: 'REP',
  });

  // 検索・フィルター用のstate
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    document.title = 'アカウント管理 - PRM Tool';
    fetchUsers();
  }, []);

  // 検索・フィルター処理
  useEffect(() => {
    let filtered = [...users];

    // 検索処理（名前、ログインID、メール、電話番号、役職で検索）
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.loginId.toLowerCase().includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
        (user.position && user.position.toLowerCase().includes(searchLower))
      );
    }

    // ロールでフィルター
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // ユーザー一覧取得
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError('アカウント一覧の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // モーダル開閉処理（新規作成または編集）
  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        loginId: user.loginId,
        password: '',
        confirmPassword: '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        position: user.position || '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        loginId: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        address: '',
        position: '',
        role: 'REP',
      });
    }
    setShowModal(true);
  };

  // モーダル閉じる処理
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
  };

  // フォーム入力変更処理
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // フォーム送信処理（作成または更新）
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // パスワード入力がある場合は確認用パスワードと一致するかチェック
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError('パスワードと確認用パスワードが一致しません');
        return;
      }
    }

    try {
      if (editingUser) {
        // 編集時：確認用パスワードを除外してバックエンドに送信
        const { confirmPassword, ...updateData } = formData;
        await userService.update(editingUser.id, updateData);
      } else {
        // 新規作成時：パスワードは必須
        if (!formData.password) {
          setError('パスワードは必須です');
          return;
        }
        // 確認用パスワードを除外してバックエンドに送信
        const { confirmPassword, ...createData } = formData;
        await userService.create(createData);
      }
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'アカウント操作に失敗しました');
    }
  };

  // アカウント削除処理
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか?')) return;

    try {
      await userService.delete(id);
      await fetchUsers();
    } catch (err) {
      setError('アカウントの削除に失敗しました');
      console.error(err);
    }
  };

  // ロールを日本語表示に変換
  const getRoleLabel = (role) => {
    switch (role) {
      case 'SYSTEM':
        return 'システム管理者';
      case 'ADMIN':
        return '管理者';
      case 'REP':
        return '担当者';
      default:
        return role;
    }
  };

  // フィルタークリア
  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
  };

  // フィルターが適用されているかチェック
  const hasActiveFilters = searchTerm || roleFilter !== 'ALL';

  return (
    <>
      <div className="accounts-container">
        <div className="accounts-header">
          <h1>アカウント管理</h1>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + 新規アカウント作成
          </button>
        </div>

        {/* 検索・フィルターエリア */}
        <div className="filter-section">
          {/* 検索バー */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="名前、ログインID、メールアドレス、電話番号、役職で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* フィルター */}
          <div className="filters">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">全てのロール</option>
              <option value="ADMIN">管理者</option>
              <option value="REP">担当者</option>
            </select>

            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="btn-clear-filters">
                フィルターをクリア
              </button>
            )}
          </div>

          {/* 検索結果の件数表示 */}
          {hasActiveFilters && (
            <div className="search-results-info">
              {filteredUsers.length}件のアカウントが見つかりました
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : filteredUsers.length === 0 ? (
          <p className="no-data">
            {hasActiveFilters ? '検索条件に一致するアカウントがありません' : 'アカウントがありません'}
          </p>
        ) : (
          <table className="accounts-table">
            <thead>
              <tr>
                <th>名前</th>
                <th>ログインID</th>
                <th>メールアドレス</th>
                <th>電話番号</th>
                <th>役職</th>
                <th>ロール</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.loginId}</td>
                  <td>{user.email || '登録なし'}</td>
                  <td>{user.phone || '登録なし'}</td>
                  <td>{user.position || '登録なし'}</td>
                  <td>{getRoleLabel(user.role)}</td>
                  <td>
                    <div className="table-actions">
                      {user.isSystemProtected ? (
                        <span className="protected-badge">保護されたアカウント</span>
                      ) : (
                        <>
                          <button onClick={() => handleOpenModal(user)} className="btn-edit">
                            編集
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="btn-delete-small">
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingUser ? 'アカウント編集' : '新規アカウント作成'}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>名前 *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>ログインID *</label>
                  <input type="text" name="loginId" value={formData.loginId} onChange={handleChange} required disabled={editingUser !== null} />
                </div>
                <div className="form-group">
                  <label>パスワード {editingUser ? '' : '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    placeholder={editingUser ? '変更する場合のみ入力' : ''} />
                </div>
                <div className="form-group">
                  <label>パスワード確認 {editingUser ? '' : '*'}</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!editingUser}
                    placeholder={editingUser ? '変更する場合のみ入力' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>メールアドレス *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@example.com" />
                </div>
                <div className="form-group">
                  <label>電話番号</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>住所</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>役職</label>
                  <input type="text" name="position" value={formData.position} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>役割 *</label>
                  <select name="role" value={formData.role} onChange={handleChange} required>
                    <option value="REP">担当者</option>
                    <option value="ADMIN">管理者</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                    キャンセル
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingUser ? '更新' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Accounts;
