const express = require('express');
const multer = require('multer');
const { uploadToPdfCo, callPdfCo, downloadResult } = require('./pdfcoClient');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(Object.assign(new Error('Only PDF files are accepted.'), { status: 400 }));
    }
    cb(null, true);
  },
});

router.post('/', upload.array('files', 10), async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required to merge.' });
    }

    // 1. Upload all files to PDF.co in parallel
    const uploadedUrls = await Promise.all(
      files.map((f) => uploadToPdfCo(f.buffer, f.originalname))
    );

    // 2. Merge via PDF.co
    const resultUrl = await callPdfCo('/pdf/merge2', {
      urls: uploadedUrls,
    });

    // 3. Download result and stream back
    const resultBuffer = await downloadResult(resultUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
