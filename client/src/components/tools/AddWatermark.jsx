import { useState } from 'react';
import { Stamp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addWatermark } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

const POSITIONS = [
  { label: 'Center', x: 200, y: 380 },
  { label: 'Top Left', x: 40, y: 760 },
  { label: 'Top Right', x: 360, y: 760 },
  { label: 'Bottom Left', x: 40, y: 60 },
  { label: 'Bottom Right', x: 360, y: 60 },
];

export default function AddWatermark({ file, onResult, disabled }) {
  const [text, setText] = useState('CONFIDENTIAL');
  const [position, setPosition] = useState(POSITIONS[0]);
  const [fontsize, setFontsize] = useState(60);
  const [opacity, setOpacity] = useState(0.4);
  const [color, setColor] = useState('#FF0000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Watermark text cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await addWatermark(file, {
        text: text.trim(),
        x: position.x,
        y: position.y,
        fontsize,
        opacity,
        color,
      });
      onResult(blob);
      triggerDownload(blob, `watermarked_${file.name}`);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to add watermark. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Watermark text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. CONFIDENTIAL, DRAFT…"
          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          disabled={disabled || loading}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Position</label>
          <select
            value={position.label}
            onChange={(e) => setPosition(POSITIONS.find((p) => p.label === e.target.value))}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            disabled={disabled || loading}
          >
            {POSITIONS.map((p) => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer"
              disabled={disabled || loading}
            />
            <span className="text-xs text-slate-500 uppercase font-mono">{color}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Font size: <span className="text-brand-500">{fontsize}px</span>
          </label>
          <input
            type="range"
            min="20"
            max="120"
            step="4"
            value={fontsize}
            onChange={(e) => setFontsize(Number(e.target.value))}
            className="w-full accent-brand-500"
            disabled={disabled || loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Opacity: <span className="text-brand-500">{Math.round(opacity * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-brand-500"
            disabled={disabled || loading}
          />
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
          Watermark added! The download has started.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Stamp className="w-4 h-4" />
            Add Watermark
          </>
        )}
      </button>
    </form>
  );
}
