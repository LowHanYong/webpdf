import {
  Type, Stamp, Minimize2, Trash2,
  FileOutput, FileInput, Globe,
  Layers, Scissors,
  Lock, LockOpen,
  FileSearch,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

export const TOOL_CATEGORIES = [
  {
    id: 'edit',
    label: 'Edit PDF',
    color: 'blue',
    tools: [
      { id: 'search-replace', label: 'Search & Replace', icon: Type, needsFile: true },
      { id: 'watermark',      label: 'Add Watermark',    icon: Stamp, needsFile: true },
      { id: 'compress',       label: 'Compress PDF',     icon: Minimize2, needsFile: true },
      { id: 'delete-pages',   label: 'Delete Pages',     icon: Trash2, needsFile: true },
    ],
  },
  {
    id: 'convert',
    label: 'Convert',
    color: 'purple',
    tools: [
      { id: 'pdf-to-format',  label: 'PDF → Word/Excel/…', icon: FileOutput, needsFile: true },
      { id: 'file-to-pdf',    label: 'File → PDF',          icon: FileInput, needsFile: false },
      { id: 'url-to-pdf',     label: 'Webpage → PDF',       icon: Globe, needsFile: false },
    ],
  },
  {
    id: 'organize',
    label: 'Organize',
    color: 'green',
    tools: [
      { id: 'merge',  label: 'Merge PDFs',    icon: Layers,  needsFile: false },
      { id: 'split',  label: 'Split / Extract Pages', icon: Scissors, needsFile: true },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    color: 'amber',
    tools: [
      { id: 'add-password',    label: 'Add Password',    icon: Lock,     needsFile: true },
      { id: 'remove-password', label: 'Remove Password', icon: LockOpen, needsFile: true },
    ],
  },
  {
    id: 'extract',
    label: 'Extract',
    color: 'rose',
    tools: [
      { id: 'extract-text', label: 'Extract Text', icon: FileSearch, needsFile: true },
    ],
  },
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap((c) => c.tools);

const CATEGORY_COLORS = {
  blue:   { dot: 'bg-blue-500',   active: 'bg-blue-50 text-blue-700 border-blue-200', header: 'text-blue-600' },
  purple: { dot: 'bg-purple-500', active: 'bg-purple-50 text-purple-700 border-purple-200', header: 'text-purple-600' },
  green:  { dot: 'bg-green-500',  active: 'bg-green-50 text-green-700 border-green-200', header: 'text-green-600' },
  amber:  { dot: 'bg-amber-500',  active: 'bg-amber-50 text-amber-700 border-amber-200', header: 'text-amber-600' },
  rose:   { dot: 'bg-rose-500',   active: 'bg-rose-50 text-rose-700 border-rose-200', header: 'text-rose-600' },
};

export default function Sidebar({ activeTool, onToolChange, hasFile }) {
  const [collapsed, setCollapsed] = useState({});

  function toggleCategory(id) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <aside className="flex flex-col gap-1 min-w-0">
      {TOOL_CATEGORIES.map((cat) => {
        const colors = CATEGORY_COLORS[cat.color];
        const isOpen = !collapsed[cat.id];

        return (
          <div key={cat.id}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors group"
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.header}`}>
                {cat.label}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}
              />
            </button>

            {/* Tool list */}
            {isOpen && (
              <ul className="mb-1 space-y-0.5 pl-1">
                {cat.tools.map(({ id, label, icon: Icon, needsFile }) => {
                  const isActive = activeTool === id;
                  const isDisabled = needsFile && !hasFile && id !== 'merge' && id !== 'file-to-pdf' && id !== 'url-to-pdf';

                  return (
                    <li key={id}>
                      <button
                        onClick={() => !isDisabled && onToolChange(id)}
                        title={isDisabled ? 'Upload a PDF first' : label}
                        className={`
                          w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-all
                          ${isActive
                            ? `border ${colors.active} font-semibold`
                            : isDisabled
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 cursor-pointer'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate leading-tight">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}
