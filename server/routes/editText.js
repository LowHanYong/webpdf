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

    const { searchText, replaceText } = req.body;
    if (!searchText) {
      return res.status(400).json({ error: 'searchText is required.' });
    }
    if (replaceText === undefined) {
      return res.status(400).json({ error: 'replaceText is required.' });
    }

    // 1. Upload to PDF.co temporary storage
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Call search & replace endpoint
    const resultUrl = await callPdfCo('/pdf/edit/replace-text', {
      url: fileUrl,
      searchString: searchText,
      replaceString: replaceText,
      caseSensitive: false,
      pages: '0-',
    });

    // 3. Download result and stream back
    const resultBuffer = await downloadResult(resultUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="edited_${req.file.originalname}"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
