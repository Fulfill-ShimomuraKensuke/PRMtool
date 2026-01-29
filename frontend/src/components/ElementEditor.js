import React from 'react';

/**
 * 要素編集パネルコンポーネント
 * 
 * 目的:
 * - 選択された要素のプロパティを編集
 * - テキスト内容、スタイル、prefix/suffixなどを設定
 * - 要素タイプに応じた適切な編集フィールドを表示
 */
const ElementEditor = ({ element, onUpdateElement }) => {

  if (!element) {
    return (
      <div style={{
        position: 'absolute',
        right: '320px',
        top: '20px',
        width: '280px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          要素を選択してください
        </div>
      </div>
    );
  }

  /**
   * 要素のプロパティを更新
   */
  const handleUpdate = (updates) => {
    onUpdateElement(element.id, updates);
  };

  /**
   * スタイルプロパティを更新
   */
  const handleStyleUpdate = (styleUpdates) => {
    handleUpdate({
      style: {
        ...element.style,
        ...styleUpdates
      }
    });
  };

  return (
    <div style={{
      position: 'absolute',
      right: '320px',
      top: '20px',
      width: '280px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: 16 }}>
        要素の編集
      </h3>

      {/* テキスト要素の編集 */}
      {element.type === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              テキスト内容
            </label>
            <textarea
              value={element.content || ''}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: 14,
                resize: 'vertical'
              }}
              placeholder="テキストを入力"
            />
          </div>
        </div>
      )}

      {/* 動的フィールドの編集 */}
      {element.type === 'field' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              フィールド名
            </label>
            <div style={{
              padding: '8px',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontSize: 14
            }}>
              {element.label}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              プレフィックス（前に付ける文字）
            </label>
            <input
              type="text"
              value={element.prefix || ''}
              onChange={(e) => handleUpdate({ prefix: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: 14
              }}
              placeholder="例: 貴社名: "
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              サフィックス（後ろに付ける文字）
            </label>
            <input
              type="text"
              value={element.suffix || ''}
              onChange={(e) => handleUpdate({ suffix: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: 14
              }}
              placeholder="例:  円"
            />
          </div>
        </div>
      )}

      {/* 共通スタイル設定 */}
      {(element.type === 'text' || element.type === 'field') && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginTop: 15,
          paddingTop: 15,
          borderTop: '1px solid #f0f0f0'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              フォントサイズ
            </label>
            <input
              type="number"
              value={element.style?.fontSize || 14}
              onChange={(e) => handleStyleUpdate({ fontSize: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: 14
              }}
              min="8"
              max="72"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              フォント太さ
            </label>
            <select
              value={element.style?.fontWeight || 'normal'}
              onChange={(e) => handleStyleUpdate({ fontWeight: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: 14
              }}
            >
              <option value="normal">標準</option>
              <option value="bold">太字</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              文字色
            </label>
            <input
              type="color"
              value={element.style?.color || '#000000'}
              onChange={(e) => handleStyleUpdate({ color: e.target.value })}
              style={{
                width: '100%',
                height: '40px',
                padding: '4px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
              テキスト配置
            </label>
            <select
              value={element.style?.align || 'left'}
              onChange={(e) => handleStyleUpdate({ align: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: 14
              }}
            >
              <option value="left">左揃え</option>
              <option value="center">中央揃え</option>
              <option value="right">右揃え</option>
            </select>
          </div>
        </div>
      )}

      {/* 位置・サイズ情報の表示 */}
      <div style={{
        marginTop: 20,
        paddingTop: 15,
        borderTop: '1px solid #f0f0f0'
      }}>
        <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
          <div><strong>位置:</strong> X: {Math.round(element.position.x)}px, Y: {Math.round(element.position.y)}px</div>
          <div><strong>サイズ:</strong> {Math.round(element.size.width)} × {Math.round(element.size.height)}px</div>
        </div>
      </div>
    </div>
  );
};

export default ElementEditor;