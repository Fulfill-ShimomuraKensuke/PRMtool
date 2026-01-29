import React from 'react';
import { FiTrash2 } from 'react-icons/fi';  // FiEdit2を削除

/**
 * 配置済み要素一覧コンポーネント
 * 
 * 目的:
 * - キャンバス上の全要素をリスト表示
 * - 各要素の選択・編集・削除を可能にする
 * - 要素タイプを視覚的に識別
 */
const ElementList = ({
  elements,
  selectedId,
  onSelectElement,
  onDeleteElement
}) => {

  /**
   * 要素タイプに応じたラベルを返す
   */
  const getElementTypeLabel = (type) => {
    const labels = {
      text: 'テキスト',
      image: '画像',
      field: '動的フィールド'
    };
    return labels[type] || type;
  };

  /**
   * 要素の表示名を生成
   * テキストの場合は内容の一部、フィールドの場合はラベル名を表示
   */
  const getElementDisplayName = (element) => {
    if (element.type === 'text') {
      const content = element.content || 'テキスト';
      return content.length > 20 ? content.substring(0, 20) + '...' : content;
    } else if (element.type === 'field') {
      return element.label || element.fieldName;
    } else if (element.type === 'image') {
      return '画像';
    }
    return '要素';
  };

  /**
   * 要素タイプに応じたアイコン色を返す
   */
  const getElementColor = (type) => {
    const colors = {
      text: '#1890ff',
      image: '#52c41a',
      field: '#fa8c16'
    };
    return colors[type] || '#666';
  };

  return (
    <div
      style={{
        width: '300px',
        background: 'white',
        borderLeft: '1px solid #ddd',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <h3 style={{
        margin: '0 0 15px 0',
        fontSize: 18,
        color: '#333'
      }}>
        配置済み要素 ({elements.length})
      </h3>

      {elements.length === 0 ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#999',
          fontSize: 14
        }}>
          要素がまだ追加されていません
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {elements.map((element, index) => (
            <div
              key={element.id}
              onClick={() => onSelectElement(element.id)}
              style={{
                padding: '12px',
                border: selectedId === element.id
                  ? '2px solid #1890ff'
                  : '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer',
                background: selectedId === element.id ? '#e6f7ff' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 12,
                    color: getElementColor(element.type),
                    fontWeight: 'bold',
                    marginBottom: 4
                  }}>
                    {getElementTypeLabel(element.type)}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {getElementDisplayName(element)}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: '#999',
                    marginTop: 4
                  }}>
                    位置: ({Math.round(element.position.x)}, {Math.round(element.position.y)})
                    サイズ: {Math.round(element.size.width)} × {Math.round(element.size.height)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteElement(element.id);
                  }}
                  style={{
                    padding: '6px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#ff4d4f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="削除"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElementList;