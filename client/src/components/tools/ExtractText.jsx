import { useState } from 'react';
import { FileSearch, Copy, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { extractText } from '../../api/pdfApi.js';

export default function ExtractText({ file, disabled }) {
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { text, pageCount, filename }
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await extractText(file, pages || undefined);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Text extraction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyText() {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadText() {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename?.replace(/\.pdf$/i, '.txt') || 'extracted.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Page range <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder='e.g. "1-3" — leave empty for all pages'
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled={disabled || loading}
          />
        </div>

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
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Extracting…</>
          ) : (
            <><FileSearch className="w-4 h-4" /> Extract Text</>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {result.pageCount ? `${result.pageCount} pages · ` : ''}
              {result.text.length.toLocaleString()} characters
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={copyText}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadText}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                .txt
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={result.text}
            className="w-full h-56 px-3 py-2.5 text-xs font-mono border border-slate-300 rounded-lg resize-none bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Extracted text will appear here…"
          />
        </div>
      )}
    </div>
  );
}
