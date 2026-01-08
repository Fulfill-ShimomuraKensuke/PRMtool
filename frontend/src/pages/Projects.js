import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import partnerService from '../services/partnerService';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Projects.css';

const Projects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);  // 🆕 追加
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

    // 🆕 検索・フィルター用のstate
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [partnerFilter, setPartnerFilter] = useState('ALL');
    const [assignedToMe, setAssignedToMe] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const projectsData = await projectService.getAll(isAdmin ? null : user?.id);
            setProjects(projectsData);
            setFilteredProjects(projectsData);  // 🆕 追加

            const partnersData = await partnerService.getAll(isAdmin ? null : user?.id);
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

    // 🆕 検索・フィルター処理
    useEffect(() => {
        let filtered = [...projects];

        // 案件名で検索
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchLower) ||
                project.partnerName.toLowerCase().includes(searchLower) ||
                project.ownerName.toLowerCase().includes(searchLower)
            );
        }

        // ステータスでフィルター
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        // パートナーでフィルター
        if (partnerFilter !== 'ALL') {
            filtered = filtered.filter(project => project.partnerId === partnerFilter);
        }

        // 自分が担当している案件でフィルター
        if (assignedToMe) {
            filtered = filtered.filter(project =>
                project.assignments && project.assignments.some(a => a.userId === user?.id)
            );
        }

        setFilteredProjects(filtered);
    }, [searchTerm, statusFilter, partnerFilter, assignedToMe, projects, user]);

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
                ownerId: project.ownerId || user?.id
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: '',
                status: 'NEW',
                partnerId: '',
                ownerId: user?.id
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
                name: formData.name,
                status: formData.status,
                partnerId: formData.partnerId,
                ownerId: user?.id,
                assignedUserIds: [],
                tableDataJson: null
            };

            if (editingProject) {
                await projectService.update(editingProject.id, payload);
            } else {
                await projectService.create(payload);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || '案件の保存に失敗しました');
            console.error('Save project error:', err);
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

    // 🆕 フィルタークリア
    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('ALL');
        setPartnerFilter('ALL');
        setAssignedToMe(false);
    };

    // 🆕 フィルターが適用されているかチェック
    const hasActiveFilters = searchTerm || statusFilter !== 'ALL' || partnerFilter !== 'ALL' || assignedToMe;

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

                {/* 🆕 検索・フィルターエリア */}
                <div className="filter-section">
                    {/* 検索バー */}
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="案件名、パートナー名、オーナー名で検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* フィルター */}
                    <div className="filters">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="ALL">全てのステータス</option>
                            <option value="NEW">新規</option>
                            <option value="IN_PROGRESS">進行中</option>
                            <option value="DONE">完了</option>
                        </select>

                        <select
                            value={partnerFilter}
                            onChange={(e) => setPartnerFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="ALL">全てのパートナー</option>
                            {partners.map(partner => (
                                <option key={partner.id} value={partner.id}>
                                    {partner.name}
                                </option>
                            ))}
                        </select>

                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={assignedToMe}
                                onChange={(e) => setAssignedToMe(e.target.checked)}
                            />
                            <span>自分が担当している案件のみ</span>
                        </label>

                        {hasActiveFilters && (
                            <button onClick={handleClearFilters} className="btn-clear-filters">
                                フィルターをクリア
                            </button>
                        )}
                    </div>

                    {/* 検索結果の件数表示 */}
                    {hasActiveFilters && (
                        <div className="search-results-info">
                            {filteredProjects.length}件の案件が見つかりました
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">読み込み中...</div>
                ) : (
                    <div className="projects-grid">
                        {filteredProjects.length === 0 ? (
                            <p className="no-data">
                                {hasActiveFilters ? '検索条件に一致する案件がありません' : '案件がありません'}
                            </p>
                        ) : (
                            filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="project-card"
                                    onClick={() => handleProjectClick(project.id)}
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