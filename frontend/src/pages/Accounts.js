import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import Navbar from '../components/Navbar';
import './Accounts.css';

const Accounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        loginId: '',
        password: '',
        email: '',
        phone: '',
        address: '',
        position: '',
        role: 'REP',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            setError('アカウント一覧の取得に失敗しました');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                loginId: user.loginId,
                password: '',
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
                email: '',
                phone: '',
                address: '',
                position: '',
                role: 'REP',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                await userService.update(editingUser.id, formData);
            } else {
                if (!formData.password) {
                    setError('パスワードは必須です');
                    return;
                }
                await userService.create(formData);
            }
            await fetchUsers();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'アカウント操作に失敗しました');
        }
    };

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

    const getRoleLabel = (role) => {
        return role === 'ADMIN' ? '管理者' : '担当者';
    };

    return (
        <>
            <Navbar />
            <div className="accounts-container">
                <div className="accounts-header">
                    <h1>アカウント管理</h1>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + 新規アカウント作成
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">読み込み中...</div>
                ) : users.length === 0 ? (
                    <p className="no-data">アカウントがありません</p>
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
                            {users.map((user) => (
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
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editingUser} placeholder={editingUser ? '変更する場合のみ入力' : ''} />
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