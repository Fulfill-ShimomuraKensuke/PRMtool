import React, { useState, useEffect } from 'react';
import partnerService from '../services/partnerService';
import Navbar from '../components/Navbar';
import './Partners.css';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);  // 🆕 追加
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    contacts: [{ contactName: '', contactInfo: '' }]
  });

  // 🆕 検索フィルター用のstate
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  // 🆕 検索フィルター処理
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPartners(partners);
    } else {
      const filtered = partners.filter(partner => {
        const searchLower = searchTerm.toLowerCase();
        // パートナー名で検索
        const nameMatch = partner.name.toLowerCase().includes(searchLower);
        // 担当者名で検索
        const contactMatch = partner.contacts.some(contact =>
          contact.contactName.toLowerCase().includes(searchLower) ||
          contact.contactInfo.toLowerCase().includes(searchLower)
        );
        return nameMatch || contactMatch;
      });
      setFilteredPartners(filtered);
    }
  }, [searchTerm, partners]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getAll();
      setPartners(data);
      setFilteredPartners(data);  // 🆕 追加
      setError('');
    } catch (err) {
      setError('パートナー一覧の取得に失敗しました');
      console.error('Fetch partners error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      contacts: [{ contactName: '', contactInfo: '' }]
    });
    setShowEditModal(true);
  };

  const handleOpenEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      phone: partner.phone || '',
      address: partner.address || '',
      contacts: partner.contacts.length > 0
        ? partner.contacts.map(c => ({ contactName: c.contactName, contactInfo: c.contactInfo }))
        : [{ contactName: '', contactInfo: '' }]
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPartner(null);
    setError('');
  };

  const handleOpenDetailModal = (partner) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPartner(null);
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { contactName: '', contactInfo: '' }]
    });
  };

  const removeContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      contacts: newContacts.length > 0 ? newContacts : [{ contactName: '', contactInfo: '' }]
    });
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.contacts];
    newContacts[index][field] = value;
    setFormData({
      ...formData,
      contacts: newContacts
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validContacts = formData.contacts.filter(
      c => c.contactName.trim() && c.contactInfo.trim()
    );

    if (validContacts.length === 0) {
      setError('最低1人の担当者（名前と連絡先）を入力してください');
      return;
    }

    try {
      const payload = {
        ...formData,
        contacts: validContacts
      };

      if (editingPartner) {
        await partnerService.update(editingPartner.id, payload);
      } else {
        await partnerService.create(payload);
      }
      fetchPartners();
      handleCloseEditModal();
    } catch (err) {
      setError('パートナーの保存に失敗しました');
      console.error('Save partner error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('このパートナーを削除してもよろしいですか？')) {
      try {
        await partnerService.delete(id);
        handleCloseDetailModal();
        fetchPartners();
      } catch (err) {
        setError('パートナーの削除に失敗しました');
        console.error('Delete partner error:', err);
      }
    }
  };

  const renderContactsCount = (contacts) => {
    if (!contacts || contacts.length === 0) {
      return <p>登録なし</p>;
    }
    return <p>{contacts.length}名</p>;
  };

  // 🆕 検索クリア
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      <Navbar />
      <div className="partners-container">
        <div className="partners-header">
          <h1>パートナー管理</h1>
          <button onClick={handleOpenCreateModal} className="btn-primary">
            新規パートナー
          </button>
        </div>

        {/* 🆕 検索バー */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="パートナー名または担当者名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={handleClearSearch} className="btn-clear">
              クリア
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <>
            {/* 🆕 検索結果の件数表示 */}
            {searchTerm && (
              <div className="search-results-info">
                {filteredPartners.length}件のパートナーが見つかりました
              </div>
            )}

            <div className="partners-grid">
              {filteredPartners.length === 0 ? (
                <p className="no-data">
                  {searchTerm ? '検索条件に一致するパートナーがありません' : 'パートナーがありません'}
                </p>
              ) : (
                filteredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="partner-card"
                    onDoubleClick={() => handleOpenDetailModal(partner)}
                  >
                    <h3>{partner.name}</h3>
                    <p><strong>代表電話:</strong> {partner.phone || '登録なし'}</p>
                    <p><strong>住所:</strong> {partner.address || '登録なし'}</p>
                    <p><strong>担当者:</strong> {renderContactsCount(partner.contacts)}</p>
                    <button
                      onClick={() => handleOpenDetailModal(partner)}
                      className="btn-detail"
                    >
                      詳細
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* 詳細モーダル */}
        {showDetailModal && selectedPartner && (
          <div className="modal-overlay" onClick={handleCloseDetailModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedPartner.name}</h2>
                <button onClick={handleCloseDetailModal} className="btn-close">×</button>
              </div>

              <div className="partner-detail-content">
                <div className="detail-section">
                  <h3>基本情報</h3>
                  <p><strong>代表電話:</strong> {selectedPartner.phone || '登録なし'}</p>
                  <p><strong>住所:</strong> {selectedPartner.address || '登録なし'}</p>
                </div>

                <div className="detail-section">
                  <h3>担当者一覧</h3>
                  {selectedPartner.contacts && selectedPartner.contacts.length > 0 ? (
                    <table className="contacts-table">
                      <thead>
                        <tr>
                          <th>氏名</th>
                          <th>連絡先</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPartner.contacts.map((contact, index) => (
                          <tr key={index}>
                            <td>{contact.contactName}</td>
                            <td>{contact.contactInfo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>担当者が登録されていません</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => handleOpenEditModal(selectedPartner)} className="btn-edit">
                  編集
                </button>
                <button onClick={() => handleDelete(selectedPartner.id)} className="btn-delete">
                  削除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 編集モーダル */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingPartner ? 'パートナー編集' : '新規パートナー'}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>企業名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>代表電話</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>住所</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>担当者 *</label>
                  <div className="contacts-list">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="contact-item">
                        <input
                          type="text"
                          placeholder="担当者名"
                          value={contact.contactName}
                          onChange={(e) => handleContactChange(index, 'contactName', e.target.value)}
                          className="form-input contact-name-input"
                        />
                        <input
                          type="text"
                          placeholder="連絡先（電話/メール）"
                          value={contact.contactInfo}
                          onChange={(e) => handleContactChange(index, 'contactInfo', e.target.value)}
                          className="form-input contact-info-input"
                        />
                        {formData.contacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="btn-remove"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addContact} className="btn-add-contact">
                    + 担当者を追加
                  </button>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={handleCloseEditModal} className="btn-cancel">
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