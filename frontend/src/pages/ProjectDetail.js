import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import userService from '../services/userService';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './ProjectDetail.css';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchProjectDetail();
        if (isAdmin) {
            fetchAllUsers();
        }
    }, [id]);

    const fetchProjectDetail = async () => {
        try {
            setLoading(true);
            const data = await projectService.getById(id);
            setProject(data);
            setSelectedUsers(data.assignments ? data.assignments.map(a => a.userId) : []);
            setError('');
        } catch (err) {
            setError('案件の取得に失敗しました');
            console.error('Fetch project error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const users = await userService.getAll();
            setAllUsers(users);
        } catch (err) {
            console.error('Fetch users error:', err);
        }
    };

    const handleOpenAssignModal = () => {
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
    };

    const handleUserToggle = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSaveAssignments = async () => {
        try {
            const payload = {
                name: project.name,
                status: project.status,
                partnerId: project.partnerId,
                ownerId: project.ownerId,
                assignedUserIds: selectedUsers
            };
            await projectService.update(id, payload);
            await fetchProjectDetail();
            handleCloseAssignModal();
        } catch (err) {
            setError('担当者の更新に失敗しました');
            console.error('Update assignments error:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('この案件を削除してもよろしいですか？')) {
            try {
                await projectService.delete(id);
                navigate('/projects');
            } catch (err) {
                setError('案件の削除に失敗しました');
                console.error('Delete project error:', err);
            }
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            NEW: '新規',
            IN_PROGRESS: '進行中',
            DONE: '完了'
        };
        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status.toLowerCase()}`;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="project-detail-container">
                    <div className="loading">読み込み中...</div>
                </div>
            </>
        );
    }

    if (!project) {
        return (
            <>
                <Navbar />
                <div className="project-detail-container">
                    <div className="error-message">案件が見つかりません</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="project-detail-container">
                <div className="detail-header">
                    <button onClick={() => navigate('/projects')} className="btn-back">
                        ← 戻る
                    </button>
                    {isAdmin && (
                        <button onClick={handleDelete} className="btn-delete">
                            削除
                        </button>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="detail-content">
                    <div className="detail-info">
                        <h1>{project.name}</h1>
                        <div className={getStatusClass(project.status)}>
                            {getStatusLabel(project.status)}
                        </div>

                        <div className="info-section">
                            <div className="info-item">
                                <label>パートナー</label>
                                <p>{project.partnerName}</p>
                            </div>
                            <div className="info-item">
                                <label>オーナー</label>
                                <p>{project.ownerName}</p>
                            </div>
                        </div>

                        <div className="assignments-section">
                            <div className="assignments-header">
                                <h3>担当者</h3>
                                {isAdmin && (
                                    <button onClick={handleOpenAssignModal} className="btn-assign">
                                        担当者を編集
                                    </button>
                                )}
                            </div>
                            {project.assignments && project.assignments.length > 0 ? (
                                <ul className="assignments-list">
                                    {project.assignments.map((assignment) => (
                                        <li key={assignment.userId}>
                                            {assignment.userName} ({assignment.userLoginId})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-assignments">担当者が割り当てられていません</p>
                            )}
                        </div>
                    </div>

                    <div className="table-section">
                        <h3>案件データ</h3>
                        <p className="coming-soon">
                            スプレッドシート機能は次のフェーズで実装予定です
                        </p>
                    </div>
                </div>

                {/* 担当者編集モーダル */}
                {showAssignModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>担当者の編集</h2>
                            <div className="users-list">
                                {allUsers.map((u) => (
                                    <label key={u.id} className="user-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(u.id)}
                                            onChange={() => handleUserToggle(u.id)}
                                        />
                                        <span>{u.name} ({u.loginId})</span>
                                    </label>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={handleCloseAssignModal} className="btn-cancel">
                                    キャンセル
                                </button>
                                <button type="button" onClick={handleSaveAssignments} className="btn-submit">
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProjectDetail;