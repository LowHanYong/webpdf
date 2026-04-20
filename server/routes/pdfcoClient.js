/**
 * Shared PDF.co API helpers used by all route handlers.
 */
const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'https://api.pdf.co/v1';

function getApiKey() {
  const key = process.env.PDF_CO_API_KEY;
  if (!key) throw Object.assign(new Error('PDF_CO_API_KEY is not configured on the server.'), { status: 500 });
  return key;
}

/**
 * Upload a file Buffer to PDF.co temporary storage.
 * Returns the temporary URL string.
 */
async function uploadToPdfCo(buffer, filename) {
  const apiKey = getApiKey();
  const base64 = buffer.toString('base64');

  const response = await axios.post(
    `${BASE_URL}/file/upload/base64`,
    { name: filename, content: base64 },
    { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } }
  );

  if (response.data.error) {
    throw Object.assign(
      new Error(`PDF.co upload error: ${response.data.message}`),
      { status: 502 }
    );
  }

  return response.data.url;
}

/**
 * Call a PDF.co processing endpoint with a JSON body.
 * Returns the result URL.
 */
async function callPdfCo(endpoint, body) {
  const apiKey = getApiKey();

  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    { ...body, async: false },
    { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } }
  );

  if (response.data.error) {
    const msg = response.data.message || 'PDF.co processing failed.';
    throw Object.assign(new Error(`PDF.co error: ${msg}`), { status: 502 });
  }

  return response.data.url;
}

/**
 * Download the result PDF from a URL and return it as a Buffer.
 */
async function downloadResult(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

/**
 * Like callPdfCo but returns the full response data object.
 * Use this for endpoints that return something other than a URL
 * (e.g. /pdf/text which returns { body: "..." }, /pdf/info, /pdf/split which returns { urls: [...] }).
 */
async function callPdfCoData(endpoint, body) {
  const apiKey = getApiKey();

  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    { ...body, async: false },
    { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } }
  );

  if (response.data.error) {
    const msg = response.data.message || 'PDF.co processing failed.';
    throw Object.assign(new Error(`PDF.co error: ${msg}`), { status: 502 });
  }

  return response.data;
}

module.exports = { uploadToPdfCo, callPdfCo, callPdfCoData, downloadResult };
