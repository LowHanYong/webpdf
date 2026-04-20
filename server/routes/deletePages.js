/**
 * POST /api/delete-pages
 * Delete specific pages from a PDF by page number(s).
 * pages param: comma-separated 1-indexed page numbers, e.g. "1,3,5" or "2-4"
 */
const express = require('express');
const multer = require('multer');
const { uploadToPdfCo, callPdfCo, downloadResult } = require('./pdfcoClient');

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
      return res.status(400).json({
        error: 'pages parameter is required (e.g. "1,3" or "2-4").',
      });
    }

    // 1. Upload to PDF.co
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Delete pages — /pdf/edit/delete-pages
    const resultUrl = await callPdfCo('/pdf/edit/delete-pages', {
      url: fileUrl,
      pages: pages.trim(),
    });

    // 3. Download and stream back
    const resultBuffer = await downloadResult(resultUrl);
    const baseName = req.file.originalname.replace(/\.pdf$/i, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}_edited.pdf"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
