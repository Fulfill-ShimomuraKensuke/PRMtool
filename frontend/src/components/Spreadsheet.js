import React, { useState, useEffect, useCallback } from 'react';
import './Spreadsheet.css';

// スプレッドシートコンポーネント
const Spreadsheet = ({ projectId, projectService }) => {
  const [tableData, setTableData] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState(null);

  // CSVインポート用のstate
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importMode, setImportMode] = useState('append'); // 'append' or 'overwrite'
  const [hasHeader, setHasHeader] = useState(true);

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

  // CSVインポートモーダルを開く
  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setCsvFile(null);
    setError('');
  };

  // CSVインポートモーダルを閉じる
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setCsvFile(null);
    setImportMode('append');
    setHasHeader(true);
  };

  // CSVファイル選択
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('CSVファイル（.csv）を選択してください');
        setCsvFile(null);
      } else {
        setCsvFile(file);
        setError('');
      }
    }
  };

  // CSVファイルを読み込んでパース
  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          if (lines.length === 0) {
            reject(new Error('CSVファイルが空です'));
            return;
          }
          const parsedData = lines.map(line => {
            // カンマで分割（簡易的な実装）
            return line.split(',').map(cell => cell.trim());
          });
          resolve(parsedData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };
      reader.readAsText(file, 'UTF-8');
    });
  };

  // CSVインポート実行
  const handleImportCsv = async () => {
    if (!csvFile) {
      setError('ファイルを選択してください');
      return;
    }
    try {
      const parsedData = await parseCsvFile(csvFile);
      if (parsedData.length === 0) {
        setError('CSVファイルにデータがありません');
        return;
      }
      let newHeaders = [...tableData.headers];
      let newRows = [...tableData.rows];
      if (importMode === 'overwrite') {
        // 上書きモード: CSVのサイズに完全に置き換える
        if (hasHeader) {
          newHeaders = parsedData[0];
          newRows = parsedData.slice(1);
        } else {
          // ヘッダーがない場合、列数に応じてヘッダーを生成
          const maxCols = Math.max(...parsedData.map(row => row.length));
          newHeaders = Array.from({ length: maxCols }, (_, i) => `列${i + 1}`);
          newRows = parsedData;
        }
      } else {
        // 追加モード
        if (hasHeader) {
          // CSVのヘッダーは無視して、データのみ追加
          const dataRows = parsedData.slice(1);
          // CSVの列数を取得
          const csvColCount = dataRows.length > 0
            ? Math.max(...dataRows.map(row => row.length))
            : 0;
          const currentColCount = tableData.headers.length;
          // CSVの列数が既存より多い場合、ヘッダーを追加
          if (csvColCount > currentColCount) {
            for (let i = currentColCount; i < csvColCount; i++) {
              newHeaders.push(`列${i + 1}`);
            }
          }
          // 列数を統一（最大列数に合わせる）
          const targetColCount = newHeaders.length;

          // 既存行の列数を調整
          newRows = newRows.map(row => {
            const adjustedRow = [...row];
            while (adjustedRow.length < targetColCount) {
              adjustedRow.push('');
            }
            return adjustedRow;
          });
          // CSVデータの列数を調整して追加
          const adjustedDataRows = dataRows.map(row => {
            const adjustedRow = [...row];
            while (adjustedRow.length < targetColCount) {
              adjustedRow.push('');
            }
            return adjustedRow;
          });
          newRows = [...newRows, ...adjustedDataRows];
        } else {
          // ヘッダーなしの場合、全データを追加
          const csvColCount = parsedData.length > 0
            ? Math.max(...parsedData.map(row => row.length))
            : 0;
          const currentColCount = tableData.headers.length;
          // CSVの列数が既存より多い場合、ヘッダーを追加
          if (csvColCount > currentColCount) {
            for (let i = currentColCount; i < csvColCount; i++) {
              newHeaders.push(`列${i + 1}`);
            }
          }
          // 列数を統一
          const targetColCount = newHeaders.length;
          // 既存行の列数を調整
          newRows = newRows.map(row => {
            const adjustedRow = [...row];
            while (adjustedRow.length < targetColCount) {
              adjustedRow.push('');
            }
            return adjustedRow;
          });
          // CSVデータの列数を調整して追加
          const adjustedDataRows = parsedData.map(row => {
            const adjustedRow = [...row];
            while (adjustedRow.length < targetColCount) {
              adjustedRow.push('');
            }
            return adjustedRow;
          });
          newRows = [...newRows, ...adjustedDataRows];
        }
      }

      setTableData({
        headers: newHeaders,
        rows: newRows
      });

      handleCloseImportModal();
      alert(`${importMode === 'overwrite' ? '上書き' : '追加'}インポートしました`);
    } catch (err) {
      setError(err.message || 'CSVのインポートに失敗しました');
      console.error('CSV import error:', err);
    }
  };

  // CSVエクスポート実行
  const handleExportCsv = () => {
    // ヘッダー行を作成
    const headers = tableData.headers.join(',');

    // データ行を作成
    const rows = tableData.rows.map(row =>
      row.map(cell => {
        // セル内にカンマや改行がある場合はダブルクォートで囲む
        if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    // CSV文字列を結合
    const csvContent = `${headers}\n${rows}`;

    // UTF-8 BOMを追加（Excel対応）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // ダウンロード用のリンクを作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // ファイル名を生成（日付付き）
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `spreadsheet_${date}.csv`);

    // ダウンロードを実行
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URLを解放
    URL.revokeObjectURL(url);
  };

  // CSVテンプレートダウンロード
  const handleDownloadTemplate = () => {
    // テンプレートヘッダーを作成（5列）
    const headers = ['列A', '列B', '列C', '列D', '列E'].join(',');

    // 空のデータ行を作成（3行）
    const emptyRows = Array(3).fill(',,,,').join('\n');

    // CSV文字列を結合
    const csvContent = `${headers}\n${emptyRows}`;

    // UTF-8 BOMを追加（Excel対応）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // ダウンロード用のリンクを作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'spreadsheet_template.csv');

    // ダウンロードを実行
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URLを解放
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="spreadsheet-container">
      <div className="spreadsheet-header">
        <h3>スプレッドシート</h3>
        <div className="spreadsheet-actions">
          <button onClick={handleDownloadTemplate} className="btn-template-csv">
            CSVテンプレート
          </button>
          <button onClick={handleOpenImportModal} className="btn-import-csv">
            CSVインポート
          </button>
          <button onClick={handleExportCsv} className="btn-export-csv">
            CSVエクスポート
          </button>
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
                <td className="row-number">
                  {rowIndex + 1}
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="btn-delete-row"
                    title="行を削除"
                  >
                    ×
                  </button>
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* CSVインポートモーダル */}
      {showImportModal && (
        <div className="modal-overlay" onClick={handleCloseImportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>CSVインポート</h2>
              <button onClick={handleCloseImportModal} className="btn-close">×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="import-options">
              <div className="form-group">
                <label htmlFor="csv-file-upload" className="file-label">
                  CSVファイルを選択
                </label>
                <input
                  type="file"
                  id="csv-file-upload"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="file-input"
                />
                {csvFile && (
                  <p className="file-name">選択中: {csvFile.name}</p>
                )}
              </div>

              <div className="form-group">
                <label>インポートモード</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={(e) => setImportMode(e.target.value)}
                    />
                    <span>追加（既存データに追加）</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="overwrite"
                      checked={importMode === 'overwrite'}
                      onChange={(e) => setImportMode(e.target.value)}
                    />
                    <span>上書き（既存データを置き換え）</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                  />
                  <span>CSVの1行目はヘッダー</span>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="btn-cancel"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                className="btn-submit"
                disabled={!csvFile}
              >
                インポート
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spreadsheet;