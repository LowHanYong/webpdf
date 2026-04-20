import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function PdfPreview({ previewUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }, []);

  const onDocumentLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <FileText className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-sm text-slate-400 font-medium">No PDF loaded</p>
        <p className="text-xs text-slate-300 mt-1">Upload a file to see the preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Controls */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2 w-full justify-between flex-wrap gap-y-2">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-xs text-slate-600 font-medium min-w-[80px] text-center">
            {numPages ? `Page ${pageNumber} / ${numPages}` : 'Loading…'}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages ?? p, p + 1))}
            disabled={!numPages || pageNumber >= numPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-xs text-slate-500 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* PDF canvas */}
      <div className="w-full overflow-auto bg-slate-100 rounded-xl border border-slate-200 min-h-[400px] flex items-start justify-center p-4">
        {loading && (
          <div className="flex items-center gap-2 py-16 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-sm">Loading PDF…</span>
          </div>
        )}
        <Document
          file={previewUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadStart={onDocumentLoadStart}
          onLoadError={(e) => console.error('PDF load error:', e)}
          className={loading ? 'invisible' : ''}
          loading=""
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderAnnotationLayer={true}
            renderTextLayer={true}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
}
