import { useState, useCallback } from 'react';

/**
 * テンプレートエディタの状態管理フック
 * 
 * 目的:
 * - キャンバス上の要素の追加・更新・削除を管理
 * - 選択中の要素を追跡
 * - 要素のID生成
 * 
 * 使用方法:
 * const { elements, selectedId, addElement, updateElement, ... } = useTemplateEditor();
 */
const useTemplateEditor = (initialElements = []) => {

  // キャンバス上の全要素を管理
  const [elements, setElements] = useState(initialElements);

  // 現在選択中の要素ID
  const [selectedId, setSelectedId] = useState(null);

  /**
   * 新しい要素IDを生成
   * タイムスタンプとランダム値を組み合わせて一意なIDを作成
   */
  const generateElementId = useCallback(() => {
    return `elem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * 新しい要素を追加
   * 
   * パラメータ:
   * - elementData: 追加する要素のデータ（type, content, position, size, style等）
   * 
   * 処理:
   * 1. 新しいIDを生成
   * 2. 要素データとIDを結合
   * 3. 要素リストに追加
   * 4. 追加した要素を自動選択
   */
  const addElement = useCallback((elementData) => {
    const newElement = {
      id: generateElementId(),
      ...elementData
    };

    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);

    return newElement.id;
  }, [generateElementId]);

  /**
   * 既存要素を更新
   * 
   * パラメータ:
   * - elementId: 更新対象の要素ID
   * - updates: 更新するプロパティ（position, size, style, content等）
   * 
   * 処理:
   * 対象要素を見つけて、指定されたプロパティのみを更新
   */
  const updateElement = useCallback((elementId, updates) => {
    setElements(prev =>
      prev.map(element =>
        element.id === elementId
          ? { ...element, ...updates }
          : element
      )
    );
  }, []);

  /**
   * 要素を削除
   * 
   * パラメータ:
   * - elementId: 削除する要素のID
   * 
   * 処理:
   * 1. 要素リストから削除
   * 2. 削除した要素が選択中だった場合、選択を解除
   */
  const deleteElement = useCallback((elementId) => {
    setElements(prev => prev.filter(element => element.id !== elementId));

    if (selectedId === elementId) {
      setSelectedId(null);
    }
  }, [selectedId]);

  /**
   * 要素を選択
   * 
   * パラメータ:
   * - elementId: 選択する要素のID
   */
  const selectElement = useCallback((elementId) => {
    setSelectedId(elementId);
  }, []);

  /**
   * 選択を解除
   */
  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  /**
   * 選択中の要素データを取得
   */
  const getSelectedElement = useCallback(() => {
    if (!selectedId) return null;
    return elements.find(element => element.id === selectedId);
  }, [elements, selectedId]);

  /**
   * 全要素をクリア
   * テンプレートのリセット時などに使用
   */
  const clearAllElements = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, []);

  /**
   * 要素の順序を変更（Z-index）
   * 
   * パラメータ:
   * - elementId: 移動する要素のID
   * - direction: 'forward' (前面へ) または 'backward' (背面へ)
   */
  const changeElementOrder = useCallback((elementId, direction) => {
    setElements(prev => {
      const index = prev.findIndex(el => el.id === elementId);
      if (index === -1) return prev;

      const newElements = [...prev];
      const [element] = newElements.splice(index, 1);

      if (direction === 'forward') {
        // 前面へ移動（配列の後ろへ）
        newElements.push(element);
      } else if (direction === 'backward') {
        // 背面へ移動（配列の前へ）
        newElements.unshift(element);
      }

      return newElements;
    });
  }, []);

  return {
    elements,
    selectedId,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    clearSelection,
    getSelectedElement,
    clearAllElements,
    changeElementOrder,
    setElements
  };
};

export default useTemplateEditor;