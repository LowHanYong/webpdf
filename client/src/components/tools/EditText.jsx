import { useState } from 'react';
import { Search, Replace, AlertCircle, CheckCircle2 } from 'lucide-react';
import { editText } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

export default function EditText({ file, onResult, disabled }) {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!searchText.trim()) {
      setError('Please enter the text to search for.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await editText(file, searchText.trim(), replaceText);
      onResult(blob);
      triggerDownload(blob, `edited_${file.name}`);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to edit text. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <Search className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
          Search for text
        </label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Text to find in the PDF…"
          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          disabled={disabled || loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <Replace className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
          Replace with
        </label>
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replacement text (leave empty to delete)…"
          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          disabled={disabled || loading}
        />
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
          Text replaced successfully! The download has started.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Replace className="w-4 h-4" />
            Apply Search & Replace
          </>
        )}
      </button>
    </form>
  );
}
