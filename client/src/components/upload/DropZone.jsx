import { useRef, useState, useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function DropZone({ onFileSelect, currentFile, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  function validateFile(file) {
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are supported.';
    }
    if (file.size > 20 * 1024 * 1024) {
      return 'File exceeds the 20MB size limit.';
    }
    return null;
  }

  const handleFile = useCallback((file) => {
    setError('');
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

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
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function clearFile(e) {
    e.stopPropagation();
    onFileSelect(null);
    setError('');
  }

  const borderColor = isDragging
    ? 'border-brand-500 bg-brand-50'
    : currentFile
    ? 'border-green-400 bg-green-50'
    : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50';

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && !currentFile && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          border-2 border-dashed rounded-xl p-8 transition-all duration-200
          ${borderColor}
          ${disabled ? 'opacity-50 cursor-not-allowed' : currentFile ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={onChange}
          className="hidden"
          disabled={disabled}
        />

        {currentFile ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{currentFile.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className={`mb-3 p-3 rounded-full transition-colors ${isDragging ? 'bg-brand-100' : 'bg-slate-200'}`}>
              <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-brand-600' : 'text-slate-500'}`} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragging ? 'Drop your PDF here' : 'Drag & drop a PDF'}
            </p>
            <p className="text-xs text-slate-400 mt-1">or click to browse — max 20MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
