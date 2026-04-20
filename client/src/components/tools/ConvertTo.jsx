import { useState } from 'react';
import { FileOutput, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { convertPdfTo } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

const FORMATS = [
  { group: 'Office', items: [
    { value: 'docx', label: 'Word Document (.docx)', icon: '📄' },
    { value: 'xlsx', label: 'Excel Spreadsheet (.xlsx)', icon: '📊' },
    { value: 'pptx', label: 'PowerPoint (.pptx)', icon: '📑' },
    { value: 'csv',  label: 'CSV Spreadsheet (.csv)',  icon: '🗃️' },
  ]},
  { group: 'Image', items: [
    { value: 'jpg', label: 'JPEG Image (.jpg)', icon: '🖼️' },
    { value: 'png', label: 'PNG Image (.png)',  icon: '🖼️' },
  ]},
  { group: 'Web & Text', items: [
    { value: 'txt',  label: 'Plain Text (.txt)',  icon: '📝' },
    { value: 'html', label: 'HTML Document (.html)', icon: '🌐' },
  ]},
];

const ALL_FORMATS = FORMATS.flatMap((g) => g.items);

export default function ConvertTo({ file, disabled }) {
  const [format, setFormat] = useState('docx');
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await convertPdfTo(file, format, pages || undefined);
      const chosen = ALL_FORMATS.find((f) => f.value === format);
      const baseName = file.name.replace(/\.pdf$/i, '');
      triggerDownload(blob, `${baseName}.${format}`);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Output format</label>
        <div className="relative">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white pr-8"
            disabled={disabled || loading}
          >
            {FORMATS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.items.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.icon} {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Page range <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder='e.g. "1-3" or "1,3,5" — leave empty for all pages'
          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={disabled || loading}
        />
      </div>

      {(format === 'jpg' || format === 'png') && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          Image conversion will return the first page. For all pages, PDF.co returns them as a zip.
        </p>
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
          Converted successfully! Download has started.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Converting…</>
        ) : (
          <><FileOutput className="w-4 h-4" /> Convert to {format.toUpperCase()}</>
        )}
      </button>
    </form>
  );
}
