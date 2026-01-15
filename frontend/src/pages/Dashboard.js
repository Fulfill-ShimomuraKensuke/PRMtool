import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import './Dashboard.css';

// ダッシュボードページコンポーネント
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 案件データの取得
  const fetchProjects = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll(user?.id);
      setProjects(data);
    } catch (err) {
      setError('案件の取得に失敗しました');
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    document.title = 'ダッシュボード - PRM Tool';
    fetchProjects();
  }, [fetchProjects]);

  // 案件ステータスのラベルとクラス名取得
  const getStatusLabel = (status) => {
    const labels = {
      NEW: '新規',
      IN_PROGRESS: '進行中',
      DONE: '完了'
    };
    return labels[status] || status;
  };

  // 案件ステータスクラス名取得
  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  // 案件カードをクリックで詳細画面へ遷移
  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // ステータス別に案件を分類
  const projectsByStatus = {
    NEW: projects.filter(p => p.status === 'NEW'),
    IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS'),
    DONE: projects.filter(p => p.status === 'DONE')
  };

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>ダッシュボード</h1>
          <p className="dashboard-subtitle">
            ようこそ、{user?.name || user?.loginId} さん
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <>
            {/* ステータス別の案件数 */}
            <div className="stats-cards">
              <div className="stat-card stat-new">
                <h3>新規案件</h3>
                <p className="stat-number">{projectsByStatus.NEW.length}</p>
              </div>
              <div className="stat-card stat-progress">
                <h3>進行中</h3>
                <p className="stat-number">{projectsByStatus.IN_PROGRESS.length}</p>
              </div>
              <div className="stat-card stat-done">
                <h3>完了</h3>
                <p className="stat-number">{projectsByStatus.DONE.length}</p>
              </div>
            </div>

            {/* 最近の案件 */}
            <div className="recent-projects">
              <h2>最近の案件</h2>
              {projects.length === 0 ? (
                <p className="no-data">案件がありません</p>
              ) : (
                <div className="projects-list">
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="project-item"
                      onClick={() => handleProjectClick(project.id)}  // クリックで詳細へ
                      style={{ cursor: 'pointer' }}  // カーソル変更
                    >
                      <div className="project-item-header">
                        <h3>{project.name}</h3>
                        <span className={getStatusClass(project.status)}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <div className="project-item-details">
                        <p>
                          <strong>パートナー:</strong> {project.partnerName}
                        </p>
                        <p>
                          <strong>担当者:</strong> {project.assignments ? project.assignments.length : 0}名
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;