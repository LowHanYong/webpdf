/**
 * Trigger a browser download of a Blob with a given filename.
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revoke to let the browser start the download
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
