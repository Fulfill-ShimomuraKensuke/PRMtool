import React from 'react';

/**
 * テキスト要素コンポーネント
 * 
 * 目的:
 * - 静的なテキストを表示
 * - ユーザーが入力した任意のテキストを描画
 * - スタイル設定（フォント、色、配置等）を適用
 * 
 * 使用場所:
 * - TemplateCanvasコンポーネント内でドラッグ可能な要素として表示
 */
const TextElement = ({ element }) => {

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '5px',
        overflow: 'hidden',
        background: 'transparent',
        border: '1px solid transparent',
        cursor: 'move'
      }}
    >
      <span
        style={{
          fontSize: element.style?.fontSize || 14,
          fontWeight: element.style?.fontWeight || 'normal',
          color: element.style?.color || '#000000',
          textAlign: element.style?.align || 'left',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {element.content || 'テキストを入力'}
      </span>
    </div>
  );
};

export default TextElement;