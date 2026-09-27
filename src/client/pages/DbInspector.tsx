import React, { useState, useEffect } from 'react';
import {
  Database,
  Table as TableIcon,
  Code2,
  RefreshCw,
  Search,
  HardDrive,
  Layers,
  FileQuestion,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { fetchDbSchema, fetchDbTable, seedDb } from '../utils/api.js';

interface DbInspectorProps {
  onDbUpdated: () => void;
}

export const DbInspector: React.FC<DbInspectorProps> = ({ onDbUpdated }) => {
  const [schemaData, setSchemaData] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('topics');
  const [tableContent, setTableContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const loadSchema = async () => {
    try {
      setLoading(true);
      const data = await fetchDbSchema();
      setSchemaData(data);
    } catch (err: any) {
      console.error('Error fetching DB schema:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (table: string) => {
    try {
      const data = await fetchDbTable(table);
      setTableContent(data);
    } catch (err: any) {
      console.error(`Error loading table ${table}:`, err);
    }
  };

  useEffect(() => {
    loadSchema();
  }, []);

  useEffect(() => {
    if (selectedTable !== 'schema') {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  const handleSeed = async () => {
    if (!confirm('Bạn có chắc chắn muốn nạp lại dữ liệu kỹ thuật mẫu vào SQLite (app.db)?')) return;
    try {
      setSeeding(true);
      await seedDb();
      await loadSchema();
      if (selectedTable !== 'schema') {
        await loadTableData(selectedTable);
      }
      onDbUpdated();
      alert('Đã nạp lại dữ liệu kỹ thuật mẫu thành công!');
    } catch (err: any) {
      alert(`Lỗi nạp dữ liệu: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter rows
  const filteredRows = (tableContent?.rows || []).filter((row: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row).some((val) =>
      val !== null && val !== undefined ? String(val).toLowerCase().includes(query) : false
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white">Trình Kiểm Tra SQLite Database (DB Inspector)</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
              WAL Mode ON
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Tệp tin lưu trữ: <span className="text-cyan-400">./data/app.db</span> | Driver:{' '}
            <span className="text-slate-300">better-sqlite3</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSchema}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
          >
            <Layers className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Đang Nạp Mẫu...' : 'Nạp Lại Dữ Liệu Mẫu'}</span>
          </button>
        </div>
      </div>

      {/* Database Metric Summary Cards */}
      {schemaData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Dung Lượng DB</span>
              <HardDrive className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {formatFileSize(schemaData.stats.fileSize)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Pragma: synchronous=NORMAL</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Bảng topics</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {schemaData.counts?.topics ?? 0} <span className="text-xs font-normal text-slate-400">hàng</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">3 Cấp phân cấp cây</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Bảng questions</span>
              <FileQuestion className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {schemaData.counts?.questions ?? 0} <span className="text-xs font-normal text-slate-400">câu hỏi</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Auto Regex Media Parser</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Bảng media_assets</span>
              <ImageIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {schemaData.counts?.media_assets ?? 0} <span className="text-xs font-normal text-slate-400">ảnh</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Static URL: /media/:file</div>
          </div>
        </div>
      )}

      {/* Interactive Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            {['topics', 'questions', 'options', 'media_assets'].map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-medium transition ${
                  selectedTable === tbl
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{tbl}</span>
                <span className="text-[10px] opacity-75">
                  ({schemaData?.counts?.[tbl] ?? 0})
                </span>
              </button>
            ))}

            <button
              onClick={() => setSelectedTable('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-medium transition ${
                selectedTable === 'schema'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>DDL Schema SQL</span>
            </button>
          </div>

          {/* Search bar inside active table */}
          {selectedTable !== 'schema' && (
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Tìm trong ${selectedTable}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* View 1: Active Table Data Grid */}
        {selectedTable !== 'schema' && tableContent && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-cyan-400">
                  {tableContent.columns?.map((col: any) => (
                    <th key={col.cid} className="p-3 font-semibold whitespace-nowrap">
                      {col.name}
                      <span className="ml-1 text-[10px] text-slate-500 font-normal">
                        ({col.type})
                      </span>
                    </th>
                  ))}
                  {selectedTable === 'media_assets' && (
                    <th className="p-3 font-semibold">Xem Trước</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={(tableContent.columns?.length || 1) + 1}
                      className="p-8 text-center text-slate-500"
                    >
                      Không có bản ghi nào
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row: any, rIdx: number) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-slate-800/40 transition-colors text-slate-300"
                    >
                      {tableContent.columns?.map((col: any) => {
                        const val = row[col.name];
                        const isJson =
                          typeof val === 'string' &&
                          (val.startsWith('[') || val.startsWith('{')) &&
                          (col.name === 'media_keys' || col.name === 'tags');

                        return (
                          <td
                            key={col.cid}
                            className="p-3 max-w-[260px] truncate"
                            title={String(val)}
                          >
                            {isJson ? (
                              <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 text-[11px]">
                                {val}
                              </span>
                            ) : val === null || val === undefined ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : typeof val === 'number' &&
                              (col.name === 'has_context_image' ||
                                col.name === 'has_media' ||
                                col.name === 'is_correct') ? (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  val === 1
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {val === 1 ? '1 (TRUE)' : '0 (FALSE)'}
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}

                      {selectedTable === 'media_assets' && (
                        <td className="p-2">
                          <img
                            src={row.url}
                            alt={row.alt_text || 'Media'}
                            className="w-16 h-10 object-contain rounded border border-slate-700 bg-slate-950"
                          />
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Schema DDL Inspector */}
        {selectedTable === 'schema' && schemaData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Cấu trúc bảng (CREATE TABLE) &amp; Chỉ mục (INDEX):
              </span>
              <button
                onClick={() => {
                  const sql = schemaData.tables?.map((t: any) => t.sql).join('\n\n');
                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Đã sao chép' : 'Sao chép toàn bộ DDL'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {schemaData.tables?.map((t: any) => (
                <div
                  key={t.name}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800/80 pb-1.5">
                    <span>TABLE: {t.name}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {schemaData.counts?.[t.name] ?? 0} bản ghi
                    </span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {t.sql}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
