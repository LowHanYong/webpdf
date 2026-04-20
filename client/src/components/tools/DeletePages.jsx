import { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { deletePages } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

export default function DeletePages({ file, onResult, disabled }) {
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pages.trim()) {
      setError('Please specify which pages to delete.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await deletePages(file, pages.trim());
      onResult(blob);
      triggerDownload(blob, `edited_${file.name}`);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to delete pages. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-red-700">
          The specified pages will be <strong>permanently removed</strong> from the PDF. This cannot be undone after download.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Pages to delete</label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder='e.g. "1,3" or "2-4" (1-indexed)'
          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={disabled || loading}
          required
        />
        <p className="text-xs text-slate-400 mt-1">Use commas for individual pages or a dash for a range.</p>
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
          Pages deleted successfully! Download has started.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Removing pages…</>
        ) : (
          <><Trash2 className="w-4 h-4" /> Delete Pages</>
        )}
      </button>
    </form>
  );
}
