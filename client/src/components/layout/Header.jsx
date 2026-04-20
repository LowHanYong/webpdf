import { FileEdit, Menu } from 'lucide-react';

export default function Header({ onMenuToggle }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-500 rounded-lg">
              <FileEdit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-base tracking-tight">
              PDF<span className="text-brand-500">Editor</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
              Powered by PDF.co
            </span>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Toggle tool menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
