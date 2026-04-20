# PDFEditor — Online PDF Editing Service

A modern, full-stack PDF editing web app built with React (Vite) + Node.js (Express) + PDF.co API.

## Features

| Tool | Description |
|---|---|
| **Edit Text** | Search & replace text across all pages |
| **Add Watermark** | Overlay custom text with color, opacity & position controls |
| **Merge PDFs** | Combine up to 10 PDFs into one document |
| **Protect PDF** | Add AES-256 password encryption |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [PDF.co](https://pdf.co) API key (free tier available)

## Setup

### 1. Clone / open the project

```
c:\project\pdfeditor\
├── client\    ← React + Vite frontend
└── server\    ← Express backend
```

### 2. Configure the backend

Edit `server/.env`:

```env
PDF_CO_API_KEY=your_pdfco_api_key_here
PORT=5000
```

> Get a free API key at https://app.pdf.co/signup

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Run in development

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
pdfeditor/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── pdfApi.js          # All fetch() calls to backend
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx     # Nav bar + tool tabs
│   │   │   │   └── LoadingOverlay.jsx
│   │   │   ├── preview/
│   │   │   │   └── PdfPreview.jsx # react-pdf viewer with zoom/page controls
│   │   │   ├── tools/
│   │   │   │   ├── EditText.jsx
│   │   │   │   ├── AddWatermark.jsx
│   │   │   │   ├── MergePdfs.jsx
│   │   │   │   └── ProtectPdf.jsx
│   │   │   └── upload/
│   │   │       └── DropZone.jsx   # Drag & drop file upload
│   │   ├── hooks/
│   │   │   └── usePdfFile.js      # Shared file + result state
│   │   └── utils/
│   │       └── download.js        # Browser download trigger
│   ├── vite.config.js             # Dev proxy: /api → localhost:5000
│   └── tailwind.config.js
│
└── server/
    ├── routes/
    │   ├── pdfcoClient.js         # Shared PDF.co API helpers
    │   ├── editText.js            # POST /api/edit-text
    │   ├── watermark.js           # POST /api/watermark
    │   ├── merge.js               # POST /api/merge
    │   └── protect.js             # POST /api/protect
    └── index.js                   # Express entry point
```

## How It Works

```
User uploads PDF
  → DropZone saves file to React state
  → react-pdf renders live preview

User configures tool and clicks Apply
  → Tool component POSTs FormData to /api/<tool>
  → Express uploads file to PDF.co temporary storage
  → Express calls PDF.co processing endpoint
  → Express streams result PDF back
  → Browser auto-downloads the result
  → Preview updates to show the processed file
```

## API Endpoints

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/edit-text` | `file`, `searchText`, `replaceText` | Search & replace |
| POST | `/api/watermark` | `file`, `text`, `x`, `y`, `fontsize`, `opacity`, `color` | Add watermark |
| POST | `/api/merge` | `files[]` (multiple) | Merge PDFs |
| POST | `/api/protect` | `file`, `password` | Add password |
| GET | `/api/health` | — | Health check |

## Build for Production

```bash
# Build frontend
cd client
npm run build
# Output: client/dist/

# Serve static files from Express (optional)
# Add: app.use(express.static('../client/dist')) to server/index.js
```
