/**
 * POST /api/compress
 * Compress/optimize a PDF to reduce file size.
 */
const express = require('express');
const multer = require('multer');
const { uploadToPdfCo, callPdfCo, downloadResult } = require('./pdfcoClient');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for compress (input might be large)
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

    const originalSize = req.file.size;

    // 1. Upload to PDF.co
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Optimize — /pdf/optimize
    const resultUrl = await callPdfCo('/pdf/optimize', { url: fileUrl });

    // 3. Download and stream back
    const resultBuffer = await downloadResult(resultUrl);
    const baseName = req.file.originalname.replace(/\.pdf$/i, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}_compressed.pdf"`);
    res.setHeader('X-Original-Size', originalSize);
    res.setHeader('X-Compressed-Size', resultBuffer.length);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
