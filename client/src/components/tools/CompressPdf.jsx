import { useState } from 'react';
import { Minimize2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { compressPdf } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

function formatBytes(bytes) {
  if (!bytes) return '–';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function CompressPdf({ file, onResult, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { original, compressed, savings }

  async function handleCompress(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const blob = await compressPdf(file);
      onResult(blob);

      const original = parseInt(blob._headers?.originalSize) || file.size;
      const compressed = parseInt(blob._headers?.compressedSize) || blob.size;
      const savingsPct = original > 0 ? Math.round((1 - compressed / original) * 100) : 0;

      setResult({ original, compressed, savings: savingsPct });
      triggerDownload(blob, `compressed_${file.name}`);
    } catch (err) {
      setError(err.message || 'Compression failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCompress} className="space-y-4">
      <p className="text-sm text-slate-600">
        Optimize your PDF to reduce file size while preserving quality. Works best on PDFs with
        high-resolution images or unoptimized embedded content.
      </p>

      {file && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Current file size</p>
          <p className="text-base font-semibold text-slate-800 mt-0.5">{formatBytes(file.size)}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Compression complete
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-slate-500">Before</p>
              <p className="text-sm font-bold text-slate-700">{formatBytes(result.original)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">After</p>
              <p className="text-sm font-bold text-green-700">{formatBytes(result.compressed)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Saved</p>
              <p className={`text-sm font-bold ${result.savings > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                {result.savings > 0 ? `${result.savings}%` : '–'}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Compressing…</>
        ) : (
          <><Minimize2 className="w-4 h-4" /> Compress PDF</>
        )}
      </button>
    </form>
  );
}
