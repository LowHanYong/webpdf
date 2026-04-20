import { useRef, useState } from 'react';
import { Layers, Plus, X, AlertCircle, CheckCircle2, UploadCloud } from 'lucide-react';
import { mergePdfs } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

export default function MergePdfs({ onResult, disabled }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function addFiles(newFiles) {
    setError('');
    const pdfs = Array.from(newFiles).filter((f) => f.type === 'application/pdf');
    const nonPdfs = Array.from(newFiles).length - pdfs.length;
    if (nonPdfs > 0) setError(`${nonPdfs} non-PDF file(s) were skipped.`);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const unique = pdfs.filter((f) => !existing.has(f.name + f.size));
      return [...prev, ...unique].slice(0, 10);
    });
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setSuccess(false);
  }

  function onDragOver(e) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  }

  async function handleMerge(e) {
    e.preventDefault();
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await mergePdfs(files);
      onResult(blob);
      triggerDownload(blob, 'merged.pdf');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to merge PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all duration-200
          ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          className="hidden"
          disabled={disabled}
        />
        <UploadCloud className={`w-7 h-7 mb-2 ${isDragging ? 'text-brand-500' : 'text-slate-400'}`} />
        <p className="text-sm font-medium text-slate-600">
          {isDragging ? 'Drop PDFs here' : 'Add PDFs to merge'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Drag & drop or click — up to 10 files</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
              <span className="text-xs font-bold text-slate-400 w-5 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{f.name}</p>
                <p className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                disabled={loading}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length === 0 && (
        <p className="text-xs text-center text-slate-400 py-2">No files added yet</p>
      )}

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      {success && (
        <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          PDFs merged successfully! The download has started.
        </p>
      )}

      <button
        type="button"
        onClick={handleMerge}
        disabled={disabled || loading || files.length < 2}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Merging {files.length} files…
          </>
        ) : (
          <>
            <Layers className="w-4 h-4" />
            Merge {files.length > 0 ? `${files.length} PDFs` : 'PDFs'}
          </>
        )}
      </button>
    </div>
  );
}
