import { useRef, useState, useCallback } from 'react';
import { FileInput, UploadCloud, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { convertFileToPdf } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

const ACCEPTED = [
  '.doc,.docx',
  '.xls,.xlsx',
  '.ppt,.pptx',
  '.jpg,.jpeg,.png,.tiff,.bmp,.gif,.webp',
  '.html',
].join(',');

const TYPE_LABELS = {
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-powerpoint': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
};

function fileTypeLabel(f) {
  if (f.type.startsWith('image/')) return 'Image';
  return TYPE_LABELS[f.type] || 'File';
}

export default function ConvertFrom({ onResult, disabled }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFile = useCallback((f) => {
    setError('');
    setSuccess(false);
    setFile(f);
  }, []);

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleConvert(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await convertFileToPdf(file);
      onResult(blob);
      const baseName = file.name.replace(/\.[^.]+$/, '');
      triggerDownload(blob, `${baseName}.pdf`);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={onDrop}
        onClick={() => !disabled && !file && inputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all duration-200
          ${isDragging ? 'border-brand-500 bg-brand-50' : file ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50 cursor-pointer'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
          className="hidden"
          disabled={disabled}
        />

        {file ? (
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{fileTypeLabel(file)} · {(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setSuccess(false); }}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-brand-500' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-600">Drop file here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">Word, Excel, PowerPoint, Images, HTML</p>
          </>
        )}
      </div>

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Converted to PDF! Download has started.
        </p>
      )}

      <button
        type="button"
        onClick={handleConvert}
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Converting…</>
        ) : (
          <><FileInput className="w-4 h-4" /> Convert to PDF</>
        )}
      </button>
    </div>
  );
}
