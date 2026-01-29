import React, { useState } from 'react';
import { FiType, FiImage, FiTag } from 'react-icons/fi';

/**
 * 要素追加ツールバーコンポーネント
 * 
 * 目的:
 * - テキスト、画像、動的フィールドを追加するUIを提供
 * - 各要素タイプのボタンを表示
 * - 動的フィールドは選択メニューから選択
 * 
 * 配置場所:
 * - エディタ画面の左側
 */
const ElementToolbar = ({ onAddElement }) => {

  // 動的フィールドメニューの表示/非表示
  const [showFieldMenu, setShowFieldMenu] = useState(false);

  /**
   * 利用可能な動的フィールドの定義
   * 請求書データから取得できる値を列挙
   */
  const availableFields = [
    { name: 'companyName', label: '企業名' },
    { name: 'industry', label: '業種' },
    { name: 'address', label: '住所' },
    { name: 'phone', label: '代表電話' },
    { name: 'representativeName', label: '担当者名' },
    { name: 'issueDate', label: '発行日' },
    { name: 'dueDate', label: '支払期限' },
    { name: 'totalAmount', label: '合計金額' }
  ];

  /**
   * テキスト要素を追加
   * デフォルトのテキストとスタイルで初期化
   */
  const handleAddText = () => {
    onAddElement({
      type: 'text',
      content: 'テキストを入力',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 40 },
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        align: 'left'
      }
    });
  };

  /**
   * 画像要素を追加
   * ファイル選択ダイアログを開き、選択された画像をアップロード
   */
  const handleAddImage = () => {
    // ファイル選択用のinput要素を動的に作成
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // 画像をData URLとして読み込み
        const reader = new FileReader();
        reader.onload = (event) => {
          onAddElement({
            type: 'image',
            url: event.target.result,
            position: { x: 100, y: 100 },
            size: { width: 200, height: 150 }
          });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  /**
   * 動的フィールド要素を追加
   * 選択されたフィールドタイプで初期化
   */
  const handleAddField = (field) => {
    onAddElement({
      type: 'field',
      fieldName: field.name,
      label: field.label,
      position: { x: 100, y: 100 },
      size: { width: 250, height: 30 },
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        align: 'left'
      },
      prefix: '',
      suffix: ''
    });

    setShowFieldMenu(false);
  };

  return (
    <div
      className="element-toolbar"
      style={{
        width: '250px',
        background: 'white',
        borderRight: '1px solid #ddd',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}
    >
      <h3 style={{
        margin: '0 0 15px 0',
        fontSize: 18,
        color: '#333'
      }}>
        要素を追加
      </h3>

      {/* テキスト追加ボタン */}
      <button
        onClick={handleAddText}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          fontSize: 14,
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f5f5f5';
          e.target.style.borderColor = '#1890ff';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'white';
          e.target.style.borderColor = '#d9d9d9';
        }}
      >
        <FiType size={18} />
        <span>テキスト追加</span>
      </button>

      {/* 画像追加ボタン */}
      <button
        onClick={handleAddImage}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          fontSize: 14,
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f5f5f5';
          e.target.style.borderColor = '#1890ff';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'white';
          e.target.style.borderColor = '#d9d9d9';
        }}
      >
        <FiImage size={18} />
        <span>画像追加</span>
      </button>

      {/* 動的フィールド追加 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowFieldMenu(!showFieldMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: showFieldMenu ? '#f5f5f5' : 'white',
            cursor: 'pointer',
            fontSize: 14,
            width: '100%',
            transition: 'all 0.3s'
          }}
        >
          <FiTag size={18} />
          <span>動的フィールド追加</span>
        </button>

        {/* フィールド選択メニュー */}
        {showFieldMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '5px',
              background: 'white',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {availableFields.map(field => (
              <button
                key={field.name}
                onClick={() => handleAddField(field)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                {field.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 使用ガイド */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '4px',
        fontSize: 12,
        color: '#666',
        lineHeight: 1.5
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 5 }}>使い方:</div>
        <div>1. ボタンをクリックして要素を追加</div>
        <div>2. キャンバス上でドラッグして配置</div>
        <div>3. 角をドラッグしてサイズ変更</div>
        <div>4. クリックして編集パネルで詳細設定</div>
      </div>
    </div>
  );
};

export default ElementToolbar;