import { useState } from 'react';
import { Globe, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { urlToPdf } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

export default function UrlToPdf({ onResult, disabled }) {
  const [url, setUrl] = useState('');
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await urlToPdf(trimmed, { paperSize, orientation });
      onResult(blob);
      const hostname = new URL(trimmed).hostname.replace(/\./g, '_');
      triggerDownload(blob, `${hostname}.pdf`);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to convert URL to PDF. Make sure the URL is publicly accessible.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Convert any public webpage into a PDF document. The URL must be publicly accessible
        (not behind a login).
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <Globe className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
          Webpage URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/page"
          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={disabled || loading}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Paper size</label>
          <div className="relative">
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white pr-8"
              disabled={disabled || loading}
            >
              {['A4', 'Letter', 'A3', 'Legal', 'Tabloid'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Orientation</label>
          <div className="relative">
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white pr-8"
              disabled={disabled || loading}
            >
              <option value="Portrait">Portrait</option>
              <option value="Landscape">Landscape</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
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
          Webpage converted to PDF! Download has started.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Converting…</>
        ) : (
          <><Globe className="w-4 h-4" /> Convert to PDF</>
        )}
      </button>
    </form>
  );
}
