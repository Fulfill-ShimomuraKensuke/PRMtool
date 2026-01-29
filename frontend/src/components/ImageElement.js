import React from 'react';

/**
 * 画像要素コンポーネント
 * 
 * 目的:
 * - 会社ロゴや装飾画像を表示
 * - アップロードされた画像をテンプレートに配置
 * - 画像のサイズと位置を調整可能にする
 * 
 * 使用場所:
 * - TemplateCanvasコンポーネント内でドラッグ可能な要素として表示
 */
const ImageElement = ({ element }) => {

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#f5f5f5',
        border: '1px dashed #ccc'
      }}
    >
      {element.url ? (
        <img
          src={element.url}
          alt="配置画像"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          draggable={false}
        />
      ) : (
        <div style={{
          color: '#999',
          fontSize: 12,
          textAlign: 'center'
        }}>
          画像が設定されていません
        </div>
      )}
    </div>
  );
};

export default ImageElement;