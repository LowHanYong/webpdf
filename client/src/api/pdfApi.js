/**
 * All API calls to the backend PDF processing endpoints.
 * Each function returns a Blob (the processed file) or JSON, and throws on error.
 */

const API_BASE = '/api';

async function handleBlobResponse(res) {
  if (!res.ok) {
    let message = `Server error: ${res.status}`;
    try {
      const json = await res.json();
      message = json.error || message;
    } catch {
      // response was not JSON
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  // Attach response headers for extra info (e.g. compressed size)
  blob._headers = {
    originalSize: res.headers.get('X-Original-Size'),
    compressedSize: res.headers.get('X-Compressed-Size'),
  };
  return blob;
}

async function handleJsonResponse(res) {
  if (!res.ok) {
    let message = `Server error: ${res.status}`;
    try {
      const json = await res.json();
      message = json.error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

// ── EDIT ──────────────────────────────────────────────────────────────────────

export async function editText(file, searchText, replaceText) {
  const form = new FormData();
  form.append('file', file);
  form.append('searchText', searchText);
  form.append('replaceText', replaceText);
  return handleBlobResponse(await fetch(`${API_BASE}/edit-text`, { method: 'POST', body: form }));
}

export async function addWatermark(file, { text, x, y, fontsize, opacity, color }) {
  const form = new FormData();
  form.append('file', file);
  form.append('text', text);
  form.append('x', x ?? 200);
  form.append('y', y ?? 400);
  form.append('fontsize', fontsize ?? 60);
  form.append('opacity', opacity ?? 0.5);
  form.append('color', color ?? '#FF0000');
  return handleBlobResponse(await fetch(`${API_BASE}/watermark`, { method: 'POST', body: form }));
}

export async function compressPdf(file) {
  const form = new FormData();
  form.append('file', file);
  return handleBlobResponse(await fetch(`${API_BASE}/compress`, { method: 'POST', body: form }));
}

export async function deletePages(file, pages) {
  const form = new FormData();
  form.append('file', file);
  form.append('pages', pages);
  return handleBlobResponse(await fetch(`${API_BASE}/delete-pages`, { method: 'POST', body: form }));
}

// ── CONVERT ──────────────────────────────────────────────────────────────────

export async function convertPdfTo(file, format, pages) {
  const form = new FormData();
  form.append('file', file);
  form.append('format', format);
  if (pages) form.append('pages', pages);
  return handleBlobResponse(await fetch(`${API_BASE}/convert-to`, { method: 'POST', body: form }));
}

export async function convertFileToPdf(file) {
  const form = new FormData();
  form.append('file', file);
  return handleBlobResponse(await fetch(`${API_BASE}/convert-from`, { method: 'POST', body: form }));
}

export async function urlToPdf(url, options = {}) {
  return handleBlobResponse(
    await fetch(`${API_BASE}/url-to-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, ...options }),
    })
  );
}

// ── ORGANIZE ─────────────────────────────────────────────────────────────────

export async function mergePdfs(files) {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  return handleBlobResponse(await fetch(`${API_BASE}/merge`, { method: 'POST', body: form }));
}

export async function splitPdf(file, pages) {
  const form = new FormData();
  form.append('file', file);
  form.append('pages', pages);
  return handleBlobResponse(await fetch(`${API_BASE}/split`, { method: 'POST', body: form }));
}

// ── SECURITY ──────────────────────────────────────────────────────────────────

export async function protectPdf(file, password) {
  const form = new FormData();
  form.append('file', file);
  form.append('password', password);
  return handleBlobResponse(await fetch(`${API_BASE}/protect`, { method: 'POST', body: form }));
}

export async function removePassword(file, password) {
  const form = new FormData();
  form.append('file', file);
  form.append('password', password);
  return handleBlobResponse(await fetch(`${API_BASE}/remove-password`, { method: 'POST', body: form }));
}

// ── EXTRACT ───────────────────────────────────────────────────────────────────

export async function extractText(file, pages) {
  const form = new FormData();
  form.append('file', file);
  if (pages) form.append('pages', pages);
  return handleJsonResponse(await fetch(`${API_BASE}/extract-text`, { method: 'POST', body: form }));
}
