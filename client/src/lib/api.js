const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json();
}

export async function getTax(zip) {
  return fetchJSON(`/tax/${zip}`);
}

export async function getFees(state) {
  return fetchJSON(`/fees/${state}`);
}

export async function getMakes() {
  return fetchJSON('/vehicle/makes');
}

export async function getModels(make, year) {
  return fetchJSON(`/vehicle/models/${encodeURIComponent(make)}/${year}`);
}

export async function getTrims(make, model, year) {
  return fetchJSON(`/vehicle/trims/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}`);
}

export async function decodeVin(vin) {
  return fetchJSON(`/vehicle/vin/${vin}`);
}

export async function getMsrp(make, model, year, trim) {
  const trimPath = trim ? `/${encodeURIComponent(trim)}` : '';
  return fetchJSON(`/vehicle/msrp/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}${trimPath}`);
}

export async function analyzeDeal(dealData) {
  return fetchJSON('/analyze', {
    method: 'POST',
    body: JSON.stringify(dealData),
  });
}

export async function parseDocument(file) {
  const formData = new FormData();
  formData.append('document', file);

  const res = await fetch(`${API_BASE}/ocr/parse`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'OCR processing failed');
  }
  return res.json();
}

export async function parseDocumentBase64(base64Data) {
  return fetchJSON('/ocr/parse', {
    method: 'POST',
    body: JSON.stringify({ base64: base64Data }),
  });
}

/**
 * Upload multiple document files for OCR extraction.
 * @param {Array<File|Blob>} files - Array of image/PDF files to process
 * @returns {Promise<Object>} The extracted fields and raw text
 */
export async function extractDocuments(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('documents', file);
  });

  const res = await fetch(`${API_BASE}/ocr/extract`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Document extraction failed');
  }
  return res.json();
}
