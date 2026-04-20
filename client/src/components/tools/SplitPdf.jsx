import { useState } from 'react';
import { Scissors, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { splitPdf } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

export default function SplitPdf({ file, onResult, disabled }) {
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pages.trim()) {
      setError('Please enter a page range.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await splitPdf(file, pages.trim());
      onResult(blob);
      const baseName = file.name.replace(/\.pdf$/i, '');
      triggerDownload(blob, `${baseName}_p${pages.replace(/\s/g, '')}.pdf`);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Split failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 space-y-0.5">
          <p><strong>Page range formats:</strong></p>
          <p>• <code className="bg-blue-100 px-1 rounded">1-3</code> — extract pages 1 through 3</p>
          <p>• <code className="bg-blue-100 px-1 rounded">2,4,6</code> — extract specific pages</p>
          <p>• <code className="bg-blue-100 px-1 rounded">3-</code> — extract from page 3 to the end</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Pages to extract</label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder='e.g. "1-5" or "2,4,6"'
          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={disabled || loading}
          required
        />
        <p className="text-xs text-slate-400 mt-1">
          To split into multiple parts, run this tool once per part.
        </p>
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
          Pages extracted successfully! Download has started.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Extracting…</>
        ) : (
          <><Scissors className="w-4 h-4" /> Extract Pages</>
        )}
      </button>
    </form>
  );
}
