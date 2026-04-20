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
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    // 1. Upload to PDF.co temporary storage
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Add password protection via PDF.co
    const resultUrl = await callPdfCo('/pdf/security/add', {
      url: fileUrl,
      ownerPassword: password,
      userPassword: password,
      encryptionAlgorithm: 'AES256',
      allowPrinting: true,
      allowCopy: false,
    });

    // 3. Download result and stream back
    const resultBuffer = await downloadResult(resultUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="protected_${req.file.originalname}"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
