export default function LoadingOverlay({ message = 'Processing your PDF…' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 max-w-xs mx-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-500 rounded-full opacity-50 animate-pulse-soft" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">{message}</p>
          <p className="text-xs text-slate-400 mt-1">This may take a few seconds</p>
        </div>
      </div>
    </div>
  );
}
