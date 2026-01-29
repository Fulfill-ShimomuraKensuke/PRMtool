import React from 'react';

/**
 * 動的フィールド要素コンポーネント
 * 
 * 目的:
 * - 請求書作成時に実データに置き換えられるプレースホルダーを表示
 * - エディタ内ではサンプルデータで表示
 * - PDF生成時に実際の請求書データが埋め込まれる
 * 
 * 対応フィールド:
 * - companyName: 企業名
 * - industry: 業種
 * - address: 住所
 * - phone: 代表電話
 * - representativeName: 担当者名
 * - issueDate: 発行日
 * - dueDate: 支払期限
 * - totalAmount: 合計金額
 * 
 * 使用場所:
 * - TemplateCanvasコンポーネント内でドラッグ可能な要素として表示
 */
const FieldElement = ({ element }) => {

  /**
   * フィールド名に応じたサンプルデータを取得
   * エディタ内でのプレビュー用
   */
  const getSampleValue = () => {
    const sampleValues = {
      companyName: '株式会社サンプル',
      industry: '情報通信業',
      address: '東京都渋谷区〇〇1-2-3',
      phone: '03-1234-5678',
      representativeName: '山田太郎',
      issueDate: '2026年01月29日',
      dueDate: '2026年02月28日',
      totalAmount: '1,234,567'
    };

    return sampleValues[element.fieldName] || `{${element.label}}`;
  };

  /**
   * プレフィックス、値、サフィックスを結合して表示テキストを生成
   */
  const getDisplayText = () => {
    const prefix = element.prefix || '';
    const suffix = element.suffix || '';
    const value = getSampleValue();

    return `${prefix}${value}${suffix}`;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '5px',
        background: '#e6f7ff',
        border: '1px dashed #1890ff',
        borderRadius: '2px',
        overflow: 'hidden'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* フィールドアイコン（動的フィールドであることを示す） */}
        <span style={{
          fontSize: 10,
          color: '#1890ff',
          marginRight: 5,
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          📌
        </span>

        {/* フィールド値の表示 */}
        <span
          style={{
            fontSize: element.style?.fontSize || 14,
            fontWeight: element.style?.fontWeight || 'normal',
            color: element.style?.color || '#000000',
            textAlign: element.style?.align || 'left',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {getDisplayText()}
        </span>
      </div>
    </div>
  );
};

export default FieldElement;