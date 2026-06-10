// Client-shared types. API-contract types live in shared/types.d.ts and are
// re-exported here so app code has a single import site.
import type { DealAnalysisResponse } from '../../shared/types';

export type {
  Addon,
  CalculatedDeal,
  CreditTier,
  DealAnalysisResponse,
  DealInput,
  EnteredDeal,
  Features,
  Flags,
  GreenFlag,
  MarketCalc,
  MarketListing,
  MarketListings,
  NegotiationScript,
  RedFlag,
  ScoreFactor,
  TaxLaw,
  Vehicle,
} from '../../shared/types';

/** A money-ish field that the form keeps as a string but may be seeded with a number. */
export type Numish = string | number;

/** One add-on row in the deal form. */
export interface FormAddon {
  name: string;
  price: Numish;
  enabled: boolean;
  custom?: boolean;
}

/** The full deal-entry form state (also the `deal_data` we persist). */
export interface FormState {
  condition: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: Numish;
  zip: string;
  price: Numish;
  down: Numish;
  hasTradeIn: boolean;
  tradeIn: Numish;
  tradeOwed: Numish;
  hasFinancing: boolean;
  creditTier: string;
  apr: Numish;
  aprAuto: boolean;
  aprDisplay?: string;
  term: Numish;
  docFee: Numish;
  regFee: Numish;
  addons: FormAddon[];
}

/** An add-on extracted by OCR. */
export interface OcrAddon {
  name: string;
  price: Numish;
}

/** Fields the OCR step may return to pre-fill the form. */
export interface OcrFields {
  year?: Numish;
  make?: string;
  model?: string;
  trim?: string;
  vin?: string;
  condition?: string;
  mileage?: Numish;
  price?: Numish;
  down?: Numish;
  tradeIn?: Numish;
  tradeOwed?: Numish;
  apr?: Numish;
  term?: Numish;
  docFee?: Numish;
  regFee?: Numish;
  addons?: OcrAddon[];
}

/** Response envelope from the OCR extract endpoints. */
export interface ExtractResponse {
  success?: boolean;
  fields?: OcrFields;
  fieldCount?: number;
  message?: string;
  pageCount?: number;
  provider?: string;
  rawText?: string;
  conflicts?: Array<{ field: string; values: unknown[] }>;
  [key: string]: unknown;
}

/** VIN decode response (NHTSA-backed). */
export interface VinDecode {
  year?: Numish;
  make?: string;
  model?: string;
  trim?: string;
  [key: string]: unknown;
}

export interface DocFeeInfo {
  capped: boolean;
  cap?: number;
  typical?: number;
  law?: string;
}

export interface TaxResult {
  state: string;
  combinedRate: number;
  [key: string]: unknown;
}

export interface FeesResult {
  state: string;
  docFee?: DocFeeInfo;
  registration?: { estimatedRange?: number[] };
  [key: string]: unknown;
}

/** A saved report row (Supabase `reports` table). */
export interface SavedReport {
  id: string;
  name: string;
  deal_data: FormState | null;
  result: DealAnalysisResponse;
  user_id: string;
  created_at: string;
}
