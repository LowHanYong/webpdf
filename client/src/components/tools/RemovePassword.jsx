import { useState } from 'react';
import { LockOpen, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { removePassword } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

export default function RemovePassword({ file, onResult, disabled }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) {
      setError('Please enter the current PDF password.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await removePassword(file, password);
      onResult(blob);
      triggerDownload(blob, `unlocked_${file.name}`);
      setSuccess(true);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Failed to unlock PDF. Check that the password is correct.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Remove password protection from a PDF. You must provide the current owner or user password.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Current password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the existing PDF password…"
            className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled={disabled || loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
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
          Password removed! The unlocked PDF has been downloaded.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Unlocking…</>
        ) : (
          <><LockOpen className="w-4 h-4" /> Remove Password</>
        )}
      </button>
    </form>
  );
}
