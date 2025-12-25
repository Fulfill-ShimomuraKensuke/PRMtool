import React, { useState, useEffect } from 'react';
import partnerService from '../services/partnerService';
import Navbar from '../components/Navbar';
import './Partners.css';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    document.title = 'パートナー管理 - PRM Tool';
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getAll();
      setPartners(data);
      setError('');
    } catch (err) {
      setError('パートナーの取得に失敗しました');
      console.error('Fetch partners error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        address: partner.address,
        phone: partner.phone
      });
    } else {
      setEditingPartner(null);
      setFormData({ name: '', address: '', phone: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPartner(null);
    setFormData({ name: '', address: '', phone: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await partnerService.update(editingPartner.id, formData);
      } else {
        await partnerService.create(formData);
      }
      fetchPartners();
      handleCloseModal();
    } catch (err) {
      setError('パートナーの保存に失敗しました');
      console.error('Save partner error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('このパートナーを削除してもよろしいですか？')) {
      try {
        await partnerService.delete(id);
        fetchPartners();
      } catch (err) {
        setError('パートナーの削除に失敗しました');
        console.error('Delete partner error:', err);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="partners-container">
        <div className="partners-header">
          <h1>パートナー管理</h1>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            新規パートナー
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <div className="partners-grid">
            {partners.length === 0 ? (
              <p className="no-data">パートナーがありません</p>
            ) : (
              partners.map((partner) => (
                <div key={partner.id} className="partner-card">
                  <h3>{partner.name}</h3>
                  <p className="partner-address">{partner.address}</p>
                  <p className="partner-phone">{partner.phone}</p>
                  <div className="partner-actions">
                    <button
                      onClick={() => handleOpenModal(partner)}
                      className="btn-edit"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="btn-delete"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingPartner ? 'パートナー編集' : '新規パートナー'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>企業名</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>住所</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>電話番号</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="form-input"
                  />
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

export default Partners;