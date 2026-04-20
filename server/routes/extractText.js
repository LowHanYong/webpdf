/**
 * POST /api/extract-text
 * Extract all text content from a PDF. Returns JSON with the text.
 */
const express = require('express');
const multer = require('multer');
const { uploadToPdfCo, callPdfCoData } = require('./pdfcoClient');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(Object.assign(new Error('Only PDF files are accepted.'), { status: 400 }));
    }
    cb(null, true);
  },
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { pages } = req.body; // optional, e.g. "0-" for all pages

    // 1. Upload to PDF.co
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Extract text — /pdf/text returns { body: "...", pageCount: N }
    const body = { url: fileUrl };
    if (pages) body.pages = pages;

    const data = await callPdfCoData('/pdf/text', body);

    res.json({
      text: data.body || '',
      pageCount: data.pageCount || null,
      filename: req.file.originalname,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
