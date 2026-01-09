import React, { useState, useEffect, useCallback } from 'react';
import './Spreadsheet.css';

const Spreadsheet = ({ projectId, projectService }) => {
  const [tableData, setTableData] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState(null);

  // テーブルデータ取得（useCallbackでメモ化）
  const fetchTableData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectService.getTableData(projectId);
      const data = JSON.parse(response.tableDataJson);
      setTableData(data);
      setError('');
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error('Fetch table data error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectService]);

  // 初期データ読み込み
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // テーブルデータ保存
  const saveTableData = async () => {
    try {
      setSaving(true);
      const tableDataJson = JSON.stringify(tableData);
      await projectService.saveTableData(projectId, tableDataJson);
      setError('');
      alert('保存しました');
    } catch (err) {
      setError('保存に失敗しました');
      console.error('Save table data error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ヘッダー変更
  const handleHeaderChange = (colIndex, value) => {
    const newHeaders = [...tableData.headers];
    newHeaders[colIndex] = value;
    setTableData({ ...tableData, headers: newHeaders });
  };

  // セル変更
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...tableData.rows];
    newRows[rowIndex][colIndex] = value;
    setTableData({ ...tableData, rows: newRows });
  };

  // 行追加
  const addRow = () => {
    const newRow = new Array(tableData.headers.length).fill('');
    setTableData({
      ...tableData,
      rows: [...tableData.rows, newRow]
    });
  };

  // 行削除
  const deleteRow = (rowIndex) => {
    if (tableData.rows.length <= 1) {
      alert('最低1行は必要です');
      return;
    }
    const newRows = tableData.rows.filter((_, index) => index !== rowIndex);
    setTableData({ ...tableData, rows: newRows });
  };

  // 列追加
  const addColumn = () => {
    const newHeaders = [...tableData.headers, `列${tableData.headers.length + 1}`];
    const newRows = tableData.rows.map(row => [...row, '']);
    setTableData({
      headers: newHeaders,
      rows: newRows
    });
  };

  // 列削除
  const deleteColumn = (colIndex) => {
    if (tableData.headers.length <= 1) {
      alert('最低1列は必要です');
      return;
    }
    const newHeaders = tableData.headers.filter((_, index) => index !== colIndex);
    const newRows = tableData.rows.map(row =>
      row.filter((_, index) => index !== colIndex)
    );
    setTableData({
      headers: newHeaders,
      rows: newRows
    });
  };

  // セルダブルクリック
  const handleCellDoubleClick = (rowIndex, colIndex) => {
    setEditingCell({ rowIndex, colIndex });
  };

  // 編集完了
  const handleCellBlur = () => {
    setEditingCell(null);
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="spreadsheet-container">
      <div className="spreadsheet-header">
        <h3>スプレッドシート</h3>
        <div className="spreadsheet-actions">
          <button onClick={addRow} className="btn-add-row">
            + 行を追加
          </button>
          <button onClick={addColumn} className="btn-add-column">
            + 列を追加
          </button>
          <button
            onClick={saveTableData}
            className="btn-save"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="spreadsheet-wrapper">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              <th className="row-number-header">#</th>
              {tableData.headers.map((header, colIndex) => (
                <th key={colIndex}>
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                    className="header-input"
                  />
                  <button
                    onClick={() => deleteColumn(colIndex)}
                    className="btn-delete-column"
                    title="列を削除"
                  >
                    ×
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="row-number">{rowIndex + 1}</td>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    {editingCell?.rowIndex === rowIndex &&
                      editingCell?.colIndex === colIndex ? (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) =>
                          handleCellChange(rowIndex, colIndex, e.target.value)
                        }
                        onBlur={handleCellBlur}
                        autoFocus
                        className="cell-input"
                      />
                    ) : (
                      <span className="cell-value">{cell || ''}</span>
                    )}
                  </td>
                ))}
                <td className="row-actions">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="btn-delete-row"
                    title="行を削除"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Spreadsheet;