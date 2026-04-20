import { useState, useEffect, useRef } from 'react';

/**
 * Manages the uploaded PDF file state and its object URL for preview.
 * Handles cleanup of object URLs to avoid memory leaks.
 */
export default function usePdfFile() {
  const [file, setFile] = useState(null);       // Original File
  const [resultBlob, setResultBlob] = useState(null); // Processed Blob from API
  const [previewUrl, setPreviewUrl] = useState(null);

  const prevUrl = useRef(null);

  useEffect(() => {
    // Revoke previous URL before creating a new one
    if (prevUrl.current) {
      URL.revokeObjectURL(prevUrl.current);
    }

    const source = resultBlob ?? file;
    if (source) {
      const url = URL.createObjectURL(source);
      setPreviewUrl(url);
      prevUrl.current = url;
    } else {
      setPreviewUrl(null);
      prevUrl.current = null;
    }

    return () => {
      if (prevUrl.current) {
        URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = null;
      }
    };
  }, [file, resultBlob]);

  function handleSetFile(newFile) {
    setResultBlob(null); // Clear result when a new file is uploaded
    setFile(newFile);
  }

  function handleSetResult(blob) {
    setResultBlob(blob);
  }

  function reset() {
    setFile(null);
    setResultBlob(null);
  }

  return {
    file,
    setFile: handleSetFile,
    resultBlob,
    setResultBlob: handleSetResult,
    previewUrl,
    reset,
    hasFile: !!file,
    hasResult: !!resultBlob,
  };
}
