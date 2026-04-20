require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Original routes
const editTextRoute = require('./routes/editText');
const watermarkRoute = require('./routes/watermark');
const mergeRoute = require('./routes/merge');
const protectRoute = require('./routes/protect');

// New routes
const convertToRoute = require('./routes/convertTo');
const convertFromRoute = require('./routes/convertFrom');
const splitRoute = require('./routes/split');
const compressRoute = require('./routes/compress');
const extractTextRoute = require('./routes/extractText');
const removePasswordRoute = require('./routes/removePassword');
const urlToPdfRoute = require('./routes/urlToPdf');
const deletePagesRoute = require('./routes/deletePages');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['X-Original-Size', 'X-Compressed-Size'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Edit ───────────────────────────────────────────────
app.use('/api/edit-text', editTextRoute);
app.use('/api/watermark', watermarkRoute);
app.use('/api/compress', compressRoute);
app.use('/api/delete-pages', deletePagesRoute);

// ── Convert ────────────────────────────────────────────
app.use('/api/convert-to', convertToRoute);
app.use('/api/convert-from', convertFromRoute);
app.use('/api/url-to-pdf', urlToPdfRoute);

// ── Organize ───────────────────────────────────────────
app.use('/api/merge', mergeRoute);
app.use('/api/split', splitRoute);

// ── Security ───────────────────────────────────────────
app.use('/api/protect', protectRoute);
app.use('/api/remove-password', removePasswordRoute);

// ── Extract ────────────────────────────────────────────
app.use('/api/extract-text', extractTextRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message || err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 20MB per file.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  const status = err.status || 500;
  const message = err.message || 'An unexpected server error occurred.';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`PDF Editor server running on http://localhost:${PORT}`);
  if (!process.env.PDF_CO_API_KEY) {
    console.warn('WARNING: PDF_CO_API_KEY is not set in .env');
  }
});
