/**
 * POST /api/remove-password
 * Remove password protection from a PDF. Requires the current owner/user password.
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

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'The current PDF password is required.' });
    }

    // 1. Upload to PDF.co
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Remove security — /pdf/security/remove
    const resultUrl = await callPdfCo('/pdf/security/remove', {
      url: fileUrl,
      ownerPassword: password,
    });

    // 3. Download and stream back
    const resultBuffer = await downloadResult(resultUrl);
    const baseName = req.file.originalname.replace(/\.pdf$/i, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}_unlocked.pdf"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
