import { useState } from 'react';
import Header from './components/layout/Header.jsx';
import Sidebar, { ALL_TOOLS, TOOL_CATEGORIES } from './components/layout/Sidebar.jsx';
import DropZone from './components/upload/DropZone.jsx';
import PdfPreview from './components/preview/PdfPreview.jsx';

// Edit tools
import EditText from './components/tools/EditText.jsx';
import AddWatermark from './components/tools/AddWatermark.jsx';
import CompressPdf from './components/tools/CompressPdf.jsx';
import DeletePages from './components/tools/DeletePages.jsx';

// Convert tools
import ConvertTo from './components/tools/ConvertTo.jsx';
import ConvertFrom from './components/tools/ConvertFrom.jsx';
import UrlToPdf from './components/tools/UrlToPdf.jsx';

// Organize tools
import MergePdfs from './components/tools/MergePdfs.jsx';
import SplitPdf from './components/tools/SplitPdf.jsx';

// Security tools
import ProtectPdf from './components/tools/ProtectPdf.jsx';
import RemovePassword from './components/tools/RemovePassword.jsx';

// Extract tools
import ExtractText from './components/tools/ExtractText.jsx';

import usePdfFile from './hooks/usePdfFile.js';
import { Download, RotateCcw, X } from 'lucide-react';

// Map tool IDs to their category color for the tool panel header
const TOOL_COLOR = Object.fromEntries(
  TOOL_CATEGORIES.flatMap((cat) => cat.tools.map((t) => [t.id, cat.color]))
);

const COLOR_BADGE = {
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100 text-green-700',
  amber:  'bg-amber-100 text-amber-700',
  rose:   'bg-rose-100 text-rose-700',
};

function ToolPanel({ toolId, file, previewUrl, setFile, setResultBlob, hasResult, reset }) {
  const needsFile = ALL_TOOLS.find((t) => t.id === toolId)?.needsFile;
  const showNoFile = needsFile && !file;

  const tool = ALL_TOOLS.find((t) => t.id === toolId);
  const Icon = tool?.icon;

  function handleResult(blob) {
    setResultBlob(blob);
  }

  return (
    <div className="space-y-5">
      {/* Upload zone — shown for tools that need a file */}
      {toolId !== 'merge' && toolId !== 'file-to-pdf' && toolId !== 'url-to-pdf' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            1 — Upload PDF
          </h2>
          <DropZone
            onFileSelect={(f) => { if (!f) reset(); else setFile(f); }}
            currentFile={file}
            disabled={false}
          />
        </div>
      )}

      {/* Tool configuration panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-1">
            {toolId !== 'merge' && toolId !== 'file-to-pdf' && toolId !== 'url-to-pdf'
              ? '2 — Configure & Apply'
              : 'Configure & Apply'}
          </h2>
          {tool && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR_BADGE[TOOL_COLOR[toolId]]}`}>
              {tool.label}
            </span>
          )}
        </div>

        {showNoFile ? (
          <div className="text-center py-8 text-slate-300">
            {Icon && <Icon className="w-10 h-10 mx-auto mb-2" />}
            <p className="text-sm text-slate-400">Upload a PDF above to use this tool.</p>
          </div>
        ) : (
          <>
            {toolId === 'search-replace'   && <EditText file={file} onResult={handleResult} disabled={!file} />}
            {toolId === 'watermark'        && <AddWatermark file={file} onResult={handleResult} disabled={!file} />}
            {toolId === 'compress'         && <CompressPdf file={file} onResult={handleResult} disabled={!file} />}
            {toolId === 'delete-pages'     && <DeletePages file={file} onResult={handleResult} disabled={!file} />}
            {toolId === 'pdf-to-format'    && <ConvertTo file={file} disabled={!file} />}
            {toolId === 'file-to-pdf'      && <ConvertFrom onResult={handleResult} disabled={false} />}
            {toolId === 'url-to-pdf'       && <UrlToPdf onResult={handleResult} disabled={false} />}
            {toolId === 'merge'            && <MergePdfs onResult={handleResult} disabled={false} />}
            {toolId === 'split'            && <SplitPdf file={file} onResult={handleResult} disabled={!file} />}
            {toolId === 'add-password'     && <ProtectPdf file={file} onResult={handleResult} disabled={!file} />}
            {toolId === 'remove-password'  && <RemovePassword file={file} onResult={handleResult} disabled={!file} />}
            {toolId === 'extract-text'     && <ExtractText file={file} disabled={!file} />}
          </>
        )}
      </div>

      {/* Reset */}
      {(file) && (
        <button
          onClick={reset}
          className="w-full py-2 px-4 border border-slate-200 text-slate-500 text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Start Over
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState('search-replace');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { file, setFile, resultBlob, setResultBlob, previewUrl, hasResult, reset } = usePdfFile();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-700">Tools</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <Sidebar
              activeTool={activeTool}
              onToolChange={(id) => { setActiveTool(id); setSidebarOpen(false); }}
              hasFile={!!file}
            />
          </div>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        {/* 3-column layout: sidebar | tool config | preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] xl:grid-cols-[240px_1fr_1fr] gap-5">

          {/* Left sidebar — desktop only */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-[calc(3.5rem+1.25rem)]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">Tools</p>
              <Sidebar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                hasFile={!!file}
              />
            </div>
          </div>

          {/* Center — tool config */}
          <div className="min-w-0">
            <ToolPanel
              toolId={activeTool}
              file={file}
              previewUrl={previewUrl}
              setFile={setFile}
              setResultBlob={setResultBlob}
              hasResult={hasResult}
              reset={reset}
            />
          </div>

          {/* Right — PDF preview */}
          <div className="min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-[calc(3.5rem+1.25rem)]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Preview
                  {hasResult && (
                    <span className="ml-2 normal-case text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Result
                    </span>
                  )}
                </h2>
                {hasResult && previewUrl && (
                  <a
                    href={previewUrl}
                    download={`result_${file?.name ?? 'document.pdf'}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                )}
              </div>
              <PdfPreview previewUrl={previewUrl} />
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-12 pb-6 text-center">
        <p className="text-xs text-slate-400">
          16 PDF tools · Powered by <span className="font-medium text-slate-500">PDF.co API</span>
          {' · '}Files processed securely and never stored permanently
        </p>
      </footer>
    </div>
  );
}
