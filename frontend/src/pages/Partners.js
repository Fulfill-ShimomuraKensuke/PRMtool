import React, { useState, useEffect } from 'react';
import partnerService from '../services/partnerService';
import Navbar from '../components/Navbar';
import './Partners.css';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);  // 🆕 詳細モーダル
  const [showEditModal, setShowEditModal] = useState(false);      // 🆕 編集モーダル
  const [selectedPartner, setSelectedPartner] = useState(null);   // 🆕 選択中のパートナー
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    contacts: [{ contactName: '', contactInfo: '' }]
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

  // 🆕 詳細モーダルを開く
  const handleOpenDetailModal = (partner) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  // 🆕 詳細モーダルを閉じる
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPartner(null);
  };

  // 🆕 編集モーダルを開く（詳細モーダルから）
  const handleOpenEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      phone: partner.phone || '',
      address: partner.address || '',
      contacts: partner.contacts && partner.contacts.length > 0
        ? partner.contacts
        : [{ contactName: '', contactInfo: '' }]
    });
    setShowDetailModal(false);  // 詳細モーダルを閉じる
    setShowEditModal(true);     // 編集モーダルを開く
  };

  // 🆕 新規作成モーダルを開く
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

  // 🆕 編集モーダルを閉じる
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPartner(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      contacts: [{ contactName: '', contactInfo: '' }]
    });
  };

  // 担当者を追加
  const handleAddContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { contactName: '', contactInfo: '' }]
    });
  };

  // 担当者を削除
  const handleRemoveContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      contacts: newContacts.length > 0 ? newContacts : [{ contactName: '', contactInfo: '' }]
    });
  };

  // 担当者情報を更新
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

    // バリデーション: 最低1人の担当者が必要
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

  // 🆕 削除処理（詳細モーダルから）
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

  // 🆕 担当者人数のみ表示（カード用）
  const renderContactsCount = (contacts) => {
    if (!contacts || contacts.length === 0) {
      return <p>登録なし</p>;
    }
    return <p>{contacts.length}名</p>;
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

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : (
          <div className="partners-grid">
            {partners.length === 0 ? (
              <p className="no-data">パートナーがありません</p>
            ) : (
              partners.map((partner) => (
                <div
                  key={partner.id}
                  className="partner-card"
                  onDoubleClick={() => handleOpenDetailModal(partner)}  // 🆕 ダブルクリック
                >
                  <h3>{partner.name}</h3>
                  <div className="partner-info">
                    <p><strong>代表電話:</strong> {partner.phone || '登録なし'}</p>
                    <p><strong>住所:</strong> {partner.address || '登録なし'}</p>
                  </div>

                  <div className="partner-contacts">
                    <strong>担当者: </strong>
                    {renderContactsCount(partner.contacts)}
                  </div>

                  {/* 🆕 詳細ボタン */}
                  <div className="partner-actions">
                    <button
                      onClick={() => handleOpenDetailModal(partner)}
                      className="btn-detail"
                    >
                      詳細
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 🆕 詳細モーダル */}
        {showDetailModal && selectedPartner && (
          <div className="modal-overlay" onClick={handleCloseDetailModal}>
            <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
              <h2>パートナー詳細</h2>

              <div className="detail-section">
                <div className="detail-item">
                  <label>企業名</label>
                  <p>{selectedPartner.name}</p>
                </div>

                <div className="detail-item">
                  <label>代表電話</label>
                  <p>{selectedPartner.phone || '登録なし'}</p>
                </div>

                <div className="detail-item">
                  <label>住所</label>
                  <p>{selectedPartner.address || '登録なし'}</p>
                </div>

                <div className="detail-item">
                  <label>担当者</label>
                  {selectedPartner.contacts && selectedPartner.contacts.length > 0 ? (
                    <div className="detail-contacts-grid">
                      {selectedPartner.contacts.map((contact, index) => (
                        <div key={contact.id || index} className="contact-grid-item">
                          <div className="contact-field">
                            <span className="contact-label">氏名：</span>
                            <span className="contact-value">{contact.contactName}</span>
                          </div>
                          <div className="contact-field">
                            <span className="contact-label">Mアドレス：</span>
                            <span className="contact-value">{contact.contactInfo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>登録なし</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseDetailModal}
                  className="btn-cancel"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedPartner)}
                  className="btn-edit-modal"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedPartner.id)}
                  className="btn-delete-modal"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 編集/新規作成モーダル */}
        {showEditModal && (
          <div className="modal-overlay" >
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
                            onClick={() => handleRemoveContact(index)}
                            className="btn-remove-contact"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="btn-add-contact"
                  >
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