/**
 * POST /api/convert-to
 * Convert a PDF to another format: docx, xlsx, pptx, jpg, png, txt, html, csv
 */
const express = require('express');
const multer = require('multer');
const { uploadToPdfCo, callPdfCo, callPdfCoData, downloadResult } = require('./pdfcoClient');

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

const FORMAT_MAP = {
  docx: {
    endpoint: '/pdf/convert/to/docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ext: 'docx',
  },
  doc: {
    endpoint: '/pdf/convert/to/doc',
    mime: 'application/msword',
    ext: 'doc',
  },
  xlsx: {
    endpoint: '/pdf/convert/to/xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ext: 'xlsx',
  },
  xls: {
    endpoint: '/pdf/convert/to/xls',
    mime: 'application/vnd.ms-excel',
    ext: 'xls',
  },
  pptx: {
    endpoint: '/pdf/convert/to/pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ext: 'pptx',
  },
  jpg: {
    endpoint: '/pdf/convert/to/jpg',
    mime: 'image/jpeg',
    ext: 'jpg',
    isImage: true,
  },
  png: {
    endpoint: '/pdf/convert/to/png',
    mime: 'image/png',
    ext: 'png',
    isImage: true,
  },
  txt: {
    endpoint: '/pdf/convert/to/text',
    mime: 'text/plain',
    ext: 'txt',
  },
  html: {
    endpoint: '/pdf/convert/to/html',
    mime: 'text/html',
    ext: 'html',
  },
  csv: {
    endpoint: '/pdf/convert/to/csv',
    mime: 'text/csv',
    ext: 'csv',
  },
};

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { format, pages } = req.body;
    if (!format || !FORMAT_MAP[format]) {
      return res.status(400).json({
        error: `Invalid format. Supported: ${Object.keys(FORMAT_MAP).join(', ')}`,
      });
    }

    const { endpoint, mime, ext, isImage } = FORMAT_MAP[format];
    const baseName = req.file.originalname.replace(/\.pdf$/i, '');

    // 1. Upload to PDF.co
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Convert
    const body = { url: fileUrl };
    if (pages) body.pages = pages; // e.g. "0-2" for page range

    let resultUrl;
    if (isImage) {
      // Image conversions may return an array of URLs (one per page)
      const data = await callPdfCoData(endpoint, body);
      // If multiple pages, use the first image URL or the single url
      resultUrl = Array.isArray(data.urls) ? data.urls[0] : data.url;
    } else {
      resultUrl = await callPdfCo(endpoint, body);
    }

    // 3. Download and stream back
    const resultBuffer = await downloadResult(resultUrl);

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.${ext}"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
