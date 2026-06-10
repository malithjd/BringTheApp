import { supabase } from './supabase';
import type {
  DealAnalysisResponse,
  DealInput,
  ExtractResponse,
  FeesResult,
  MarketListings,
  Numish,
  TaxResult,
  VinDecode,
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
    ...options,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function getTax(zip: string): Promise<TaxResult> {
  return fetchJSON(`/tax/${zip}`);
}

export async function getFees(state: string): Promise<FeesResult> {
  return fetchJSON(`/fees/${state}`);
}

export async function getMakes(): Promise<string[]> {
  return fetchJSON('/vehicle/makes');
}

export async function getModels(make: string, year: Numish): Promise<string[]> {
  return fetchJSON(`/vehicle/models/${encodeURIComponent(make)}/${year}`);
}

export async function getTrims(make: string, model: string, year: Numish): Promise<string[]> {
  return fetchJSON(`/vehicle/trims/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}`);
}

export async function decodeVin(vin: string): Promise<VinDecode> {
  return fetchJSON(`/vehicle/vin/${vin}`);
}

export async function getMsrp(make: string, model: string, year: Numish, trim?: string): Promise<{ msrp: number | null; [key: string]: unknown }> {
  const trimPath = trim ? `/${encodeURIComponent(trim)}` : '';
  return fetchJSON(`/vehicle/msrp/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}${trimPath}`);
}

export async function analyzeDeal(dealData: DealInput): Promise<DealAnalysisResponse> {
  return fetchJSON('/analyze', {
    method: 'POST',
    body: JSON.stringify(dealData),
  });
}

export async function parseDocument(file: File | Blob): Promise<ExtractResponse> {
  const formData = new FormData();
  formData.append('document', file);

  const res = await fetch(`${API_BASE}/ocr/parse`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'OCR processing failed');
  }
  return res.json() as Promise<ExtractResponse>;
}

export async function parseDocumentBase64(base64Data: string): Promise<ExtractResponse> {
  return fetchJSON('/ocr/parse', {
    method: 'POST',
    body: JSON.stringify({ base64: base64Data }),
  });
}

export async function getMarketListings(
  year: Numish,
  make: string,
  model: string,
  mileage?: Numish,
  zip?: string,
): Promise<MarketListings> {
  const params = new URLSearchParams({ year: String(year), make, model });
  if (mileage) params.set('mileage', String(mileage));
  if (zip) params.set('zip', zip);
  return fetchJSON(`/market/listings?${params}`);
}

export async function getVehiclePhoto(
  year: Numish,
  make: string,
  model: string,
  trim?: string,
): Promise<{ photoUrl: string | null }> {
  const params = new URLSearchParams({ year: String(year), make, model });
  if (trim) params.set('trim', trim);
  return fetchJSON(`/market/photo?${params}`);
}

/** Request a server-generated PDF report. Returns a Blob. */
export async function generatePdfReport(result: DealAnalysisResponse): Promise<Blob> {
  const res = await fetch(`${API_BASE}/pdf/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'PDF generation failed');
  }
  return res.blob();
}

/**
 * Email the deal report PDF to the given address. Requires the user to be
 * signed in — sends the Supabase access token as a bearer credential.
 */
export async function emailReport(result: DealAnalysisResponse, email: string): Promise<{ ok?: boolean; id?: string }> {
  const { data } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const token = data?.session?.access_token;

  const res = await fetch(`${API_BASE}/pdf/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ result, email }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'Failed to send report email');
  }
  return res.json() as Promise<{ ok?: boolean; id?: string }>;
}

export async function extractDocuments(files: Array<File | Blob>): Promise<ExtractResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('documents', file);
  });

  const res = await fetch(`${API_BASE}/ocr/extract`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'Document extraction failed');
  }
  return res.json() as Promise<ExtractResponse>;
}
