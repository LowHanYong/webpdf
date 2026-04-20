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

    const {
      text = 'WATERMARK',
      x = 200,
      y = 400,
      fontsize = 60,
      opacity = 0.5,
      color = '#FF0000',
      pages = '0-',
    } = req.body;

    if (!text.trim()) {
      return res.status(400).json({ error: 'Watermark text cannot be empty.' });
    }

    // 1. Upload to PDF.co temporary storage
    const fileUrl = await uploadToPdfCo(req.file.buffer, req.file.originalname);

    // 2. Add watermark (text annotation) via PDF.co
    // PDF.co's /pdf/edit/add supports adding text annotations
    const resultUrl = await callPdfCo('/pdf/edit/add', {
      url: fileUrl,
      annotations: [
        {
          text,
          x: Number(x),
          y: Number(y),
          pages,
          fontsize: Number(fontsize),
          opacity: Number(opacity),
          color,
          fontname: 'Helvetica',
          alignment: 'Center',
          width: 400,
          height: 80,
          isBackground: false,
        },
      ],
    });

    // 3. Download result and stream back
    const resultBuffer = await downloadResult(resultUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="watermarked_${req.file.originalname}"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
