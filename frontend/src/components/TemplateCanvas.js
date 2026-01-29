import React from 'react';
import { Rnd } from 'react-rnd';
import TextElement from './TextElement';
import ImageElement from './ImageElement';
import FieldElement from './FieldElement';

/**
 * テンプレートキャンバスコンポーネント
 * 
 * 目的:
 * - A4サイズのキャンバス領域を提供
 * - 配置された要素をドラッグ&リサイズ可能にする
 * - 要素の選択状態を視覚的に表示
 * 
 * 使用ライブラリ:
 * - react-rnd: ドラッグ&リサイズ機能を提供
 * 
 * キャンバスサイズ:
 * - 幅: 794px (A4の210mm相当)
 * - 高さ: 1123px (A4の297mm相当)
 */
const TemplateCanvas = ({
  elements,
  onUpdateElement,
  selectedId,
  onSelectElement
}) => {

  /**
   * 要素のドラッグ終了時の処理
   * 新しい位置をステートに保存
   */
  const handleDragStop = (elementId, d) => {
    onUpdateElement(elementId, {
      position: { x: d.x, y: d.y }
    });
  };

  /**
   * 要素のリサイズ終了時の処理
   * 新しいサイズと位置をステートに保存
   */
  const handleResizeStop = (elementId, ref, position) => {
    onUpdateElement(elementId, {
      position: { x: position.x, y: position.y },
      size: {
        width: ref.offsetWidth,
        height: ref.offsetHeight
      }
    });
  };

  /**
   * 要素タイプに応じた適切なコンポーネントを返す
   */
  const renderElement = (element) => {
    switch (element.type) {
      case 'text':
        return <TextElement element={element} />;
      case 'image':
        return <ImageElement element={element} />;
      case 'field':
        return <FieldElement element={element} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="template-canvas-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        background: '#f0f0f0',
        overflow: 'auto',
        minHeight: '100vh'
      }}
    >
      {/* A4サイズのキャンバス */}
      <div
        className="template-canvas"
        style={{
          width: '794px',
          height: '1123px',
          background: 'white',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid #ddd'
        }}
        onClick={(e) => {
          // キャンバスの空白部分をクリックしたら選択解除
          if (e.target.className === 'template-canvas') {
            onSelectElement(null);
          }
        }}
      >
        {/* 各要素を描画 */}
        {elements.map(element => (
          <Rnd
            key={element.id}
            position={{
              x: element.position.x,
              y: element.position.y
            }}
            size={{
              width: element.size.width,
              height: element.size.height
            }}
            onDragStop={(e, d) => handleDragStop(element.id, d)}
            onResizeStop={(e, direction, ref, delta, position) =>
              handleResizeStop(element.id, ref, position)
            }
            bounds="parent"
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true
            }}
            style={{
              border: selectedId === element.id
                ? '2px solid #1890ff'
                : '1px dashed #ccc',
              cursor: 'move',
              zIndex: selectedId === element.id ? 1000 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(element.id);
            }}
          >
            {renderElement(element)}
          </Rnd>
        ))}

        {/* キャンバスが空の場合のガイド表示 */}
        {elements.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999',
            fontSize: 16
          }}>
            <div>左側のツールバーから要素を追加してください</div>
            <div style={{ fontSize: 14, marginTop: 10 }}>
              テキスト・画像・動的フィールドを配置できます
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCanvas;