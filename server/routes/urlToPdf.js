/**
 * POST /api/url-to-pdf
 * Convert a public webpage URL to a PDF document.
 * No file upload needed — just a URL in the request body.
 */
const express = require('express');
const { callPdfCo, downloadResult } = require('./pdfcoClient');

const router = express.Router();

router.post('/', express.json(), async (req, res, next) => {
  try {
    const { url, paperSize, orientation, margins } = req.body;

    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'A valid public URL (starting with http/https) is required.' });
    }

    // Call PDF.co URL-to-PDF endpoint
    const body = {
      url,
      paperSize: paperSize || 'Letter',      // Letter, A4, A3, etc.
      orientation: orientation || 'Portrait', // Portrait or Landscape
      printBackground: true,
      marginTop: margins?.top ?? 10,
      marginBottom: margins?.bottom ?? 10,
      marginLeft: margins?.left ?? 10,
      marginRight: margins?.right ?? 10,
    };

    const resultUrl = await callPdfCo('/url/convert', body);

    // Download and stream back
    const resultBuffer = await downloadResult(resultUrl);

    // Build a filename from the URL
    const hostname = new URL(url).hostname.replace(/\./g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${hostname}.pdf"`);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
