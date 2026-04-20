/**
 * POST /api/convert-from
 * Convert Word, Excel, PowerPoint, or Image files to PDF.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadToPdfCo, callPdfCo, downloadResult } = require('./pdfcoClient');

const router = express.Router();

const ALLOWED_TYPES = {
  // Word
  'application/msword': '/pdf/convert/from/doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '/pdf/convert/from/doc',
  // Excel
  'application/vnd.ms-excel': '/pdf/convert/from/xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '/pdf/convert/from/xls',
  // PowerPoint
  'application/vnd.ms-powerpoint': '/pdf/convert/from/ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '/pdf/convert/from/ppt',
  // Images
  'image/jpeg': '/pdf/convert/from/image',
  'image/png': '/pdf/convert/from/image',
  'image/tiff': '/pdf/convert/from/image',
  'image/bmp': '/pdf/convert/from/image',
  'image/gif': '/pdf/convert/from/image',
  'image/webp': '/pdf/convert/from/image',
  // HTML
  'text/html': '/pdf/convert/from/html',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(Object.assign(
        new Error('Unsupported file type. Accepted: Word, Excel, PowerPoint, Images, HTML.'),
        { status: 400 }
      ));
    }
    cb(null, true);
  },
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const endpoint = ALLOWED_TYPES[req.file.mimetype];
    if (!endpoint) {
      return res.status(400).json({ error: 'Unsupported file type.' });
    }

    const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname));

    // 1. Upload to PDF.co
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Convert to PDF
    const resultUrl = await callPdfCo(endpoint, { url: fileUrl });

    // 3. Download and stream back
    const resultBuffer = await downloadResult(resultUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
