import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { protectPdf } from '../../api/pdfApi.js';
import { triggerDownload } from '../../utils/download.js';

export default function ProtectPdf({ file, onResult, disabled }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const blob = await protectPdf(file, password);
      onResult(blob);
      triggerDownload(blob, `protected_${file.name}`);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to protect PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0
    ? null
    : password.length < 6
    ? { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' }
    : password.length < 10
    ? { label: 'Fair', color: 'bg-yellow-400', width: 'w-1/2' }
    : { label: 'Strong', color: 'bg-green-500', width: 'w-full' };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          The PDF will be encrypted with AES-256. Both owner and user passwords will be set to the same value.
          Printing will be allowed but copying text will be disabled.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <Lock className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password…"
            className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={disabled || loading}
            required
            minLength={4}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password strength indicator */}
        {strength && (
          <div className="mt-2">
            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-200">
              <div className={`${strength.width} ${strength.color} transition-all rounded-full`} />
            </div>
            <p className={`text-xs mt-1 ${strength.color === 'bg-green-500' ? 'text-green-600' : strength.color === 'bg-yellow-400' ? 'text-yellow-600' : 'text-red-500'}`}>
              {strength.label} password
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat the password…"
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow
            ${confirmPassword && confirmPassword !== password ? 'border-red-400' : 'border-slate-300'}
          `}
          disabled={disabled || loading}
          required
        />
        {confirmPassword && confirmPassword !== password && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
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
          PDF protected successfully! The download has started.
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading || !file || !password || password !== confirmPassword}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Encrypting…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Protect PDF
          </>
        )}
      </button>
    </form>
  );
}
