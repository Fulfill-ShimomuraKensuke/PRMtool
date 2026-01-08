import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';  // 🆕 追加
import projectService from '../services/projectService';
import partnerService from '../services/partnerService';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Projects.css';

const Projects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();  // 🆕 追加
    const [projects, setProjects] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'NEW',
        partnerId: '',
        ownerId: ''
    });

    const isAdmin = user?.role === 'ADMIN';

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const projectsData = await projectService.getAll(isAdmin ? null : user?.userId);
            setProjects(projectsData);

            const partnersData = await partnerService.getAll(isAdmin ? null : user?.userId);
            setPartners(partnersData);

            setError('');
        } catch (err) {
            setError('データの取得に失敗しました');
            console.error('Fetch data error:', err);
        } finally {
            setLoading(false);
        }
    }, [user, isAdmin]);

    useEffect(() => {
        document.title = '案件管理 - PRM Tool';
        fetchData();
    }, [fetchData]);

    // 🆕 案件カードをクリックで詳細画面へ遷移
    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    const handleOpenModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                name: project.name,
                status: project.status,
                partnerId: project.partnerId || '',
                ownerId: project.ownerId || user?.userId
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: '',
                status: 'NEW',
                partnerId: '',
                ownerId: user?.userId
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProject(null);
        setFormData({ name: '', status: 'NEW', partnerId: '', ownerId: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                ownerId: user?.userId,
            };
            if (editingProject) {
                await projectService.update(editingProject.id, payload);
            } else {
                await projectService.create(payload);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError('案件の保存に失敗しました');
            console.error('Save project error:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('この案件を削除してもよろしいですか？')) {
            try {
                await projectService.delete(id);
                fetchData();
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

    return (
        <>
            <Navbar />
            <div className="projects-container">
                <div className="projects-header">
                    <h1>案件管理</h1>
                    <button onClick={() => handleOpenModal()} className="btn-primary">
                        新規案件
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">読み込み中...</div>
                ) : (
                    <div className="projects-grid">
                        {projects.length === 0 ? (
                            <p className="no-data">案件がありません</p>
                        ) : (
                            projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="project-card"
                                    onClick={() => handleProjectClick(project.id)}  // 🆕 クリックで詳細へ
                                >
                                    <h3>{project.name}</h3>
                                    <div className={getStatusClass(project.status)}>
                                        {getStatusLabel(project.status)}
                                    </div>
                                    <p className="project-partner">
                                        <strong>パートナー:</strong> {project.partnerName}
                                    </p>
                                    <p className="project-owner">
                                        <strong>オーナー:</strong> {project.ownerName}
                                    </p>
                                    {/* 🆕 担当者数を表示 */}
                                    <p className="project-assignments">
                                        <strong>担当者:</strong> {project.assignments ? project.assignments.length : 0}名
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>{editingProject ? '案件編集' : '新規案件'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>案件名</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ステータス</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        required
                                        className="form-input"
                                    >
                                        <option value="NEW">新規</option>
                                        <option value="IN_PROGRESS">進行中</option>
                                        <option value="DONE">完了</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>パートナー</label>
                                    <select
                                        value={formData.partnerId}
                                        onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                                        required
                                        className="form-input"
                                    >
                                        <option value="">選択してください</option>
                                        {partners.map(partner => (
                                            <option key={partner.id} value={partner.id}>
                                                {partner.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={handleCloseModal} className="btn-cancel">
                                        キャンセル
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        保存
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

export default Projects;