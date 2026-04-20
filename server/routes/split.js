/**
 * POST /api/split
 * Extract a page range from a PDF, returning a single PDF.
 * Use pages param like "1-3" or "2" (1-indexed).
 *
 * For splitting into multiple parts, call this endpoint multiple times.
 */
const express = require('express');
const multer = require('multer');
const { uploadToPdfCo, callPdfCoData, downloadResult } = require('./pdfcoClient');

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

    const { pages } = req.body;
    if (!pages || !pages.trim()) {
      return res.status(400).json({ error: 'pages parameter is required (e.g. "1-3" or "2,4,6").' });
    }

    // 1. Upload to PDF.co
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Split — /pdf/split returns { urls: ["..."] }
    const data = await callPdfCoData('/pdf/split', {
      url: fileUrl,
      pages: pages.trim(),
    });

    if (!data.urls || data.urls.length === 0) {
      throw Object.assign(new Error('PDF split returned no files.'), { status: 502 });
    }

    // 3. Download the first (or only) resulting PDF
    const resultBuffer = await downloadResult(data.urls[0]);
    const baseName = req.file.originalname.replace(/\.pdf$/i, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}_pages_${pages.replace(/[^0-9-,]/g, '')}.pdf"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
