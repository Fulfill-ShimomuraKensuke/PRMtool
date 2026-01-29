import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTemplateEditor from '../hooks/useTemplateEditor';
import TemplateCanvas from '../components/TemplateCanvas';
import ElementToolbar from '../components/ElementToolbar';
import ElementList from '../components/ElementList';
import ElementEditor from '../components/ElementEditor';
import invoiceTemplateService from '../services/invoiceTemplateService';

/**
 * テンプレートエディタメインページ
 * 
 * 目的:
 * - 請求書テンプレートの作成・編集画面を提供
 * - 各コンポーネントを統合して完全なエディタ機能を実現
 * - テンプレートの保存・読み込み機能
 * 
 * URL:
 * - /invoice-templates/new (新規作成)
 * - /invoice-templates/edit/:id (編集)
 */
const InvoiceTemplateEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // エディタの状態管理
  const {
    elements,
    selectedId,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    getSelectedElement,
    setElements
  } = useTemplateEditor();

  // テンプレート基本情報
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
 * 編集モードの場合、既存テンプレートを読み込み
 */
  useEffect(() => {
    // loadTemplate関数をuseEffectの中に移動
    const loadTemplate = async (templateId) => {
      try {
        setLoading(true);
        const response = await invoiceTemplateService.getById(templateId);

        setTemplateName(response.templateName);
        setDescription(response.description || '');

        // canvasLayoutをパースして要素を復元
        if (response.canvasLayout) {
          const layout = JSON.parse(response.canvasLayout);
          if (layout.elements && Array.isArray(layout.elements)) {
            setElements(layout.elements);
          }
        }
      } catch (error) {
        console.error('テンプレートの読み込みエラー:', error);
        alert('テンプレートの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    // idが存在する場合のみ実行
    if (id) {
      loadTemplate(id);
    }
  }, [id, setElements]);

  /**
   * テンプレートを保存
   */
  const handleSave = async () => {
    // バリデーション
    if (!templateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    if (elements.length === 0) {
      alert('最低1つの要素を配置してください');
      return;
    }

    try {
      setSaving(true);

      // canvasLayoutを構築
      const canvasLayout = JSON.stringify({
        version: '1.0',
        canvas: {
          width: 794,
          height: 1123,
          unit: 'px',
          pageFormat: 'A4'
        },
        elements: elements
      });

      const requestData = {
        templateName,
        description,
        canvasLayout,
        isDefault: false
      };

      if (id) {
        // 更新
        await invoiceTemplateService.update(id, requestData);
        alert('テンプレートを更新しました');
      } else {
        // 新規作成
        await invoiceTemplateService.create(requestData);
        alert('テンプレートを作成しました');
      }

      navigate('/invoice-templates');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('テンプレートの保存に失敗しました: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  /**
   * キャンセルして一覧に戻る
   */
  const handleCancel = () => {
    if (elements.length > 0) {
      if (!window.confirm('編集内容が失われますが、よろしいですか?')) {
        return;
      }
    }
    navigate('/invoice-templates');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ヘッダー */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #ddd',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="テンプレート名を入力"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明（任意）"
            style={{
              width: '100%',
              padding: '6px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              fontSize: 14,
              marginTop: '8px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 20px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '4px',
              background: saving ? '#ccc' : '#1890ff',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* 左側: 要素追加ツールバー */}
        <ElementToolbar onAddElement={addElement} />

        {/* 中央: キャンバスエリア */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <TemplateCanvas
            elements={elements}
            onUpdateElement={updateElement}
            selectedId={selectedId}
            onSelectElement={selectElement}
          />
        </div>

        {/* 右側: 配置済み要素一覧 */}
        <ElementList
          elements={elements}
          selectedId={selectedId}
          onSelectElement={selectElement}
          onDeleteElement={deleteElement}
        />

        {/* フローティング: 要素編集パネル */}
        <ElementEditor
          element={getSelectedElement()}
          onUpdateElement={updateElement}
        />
      </div>
    </div>
  );
};

export default InvoiceTemplateEditor;