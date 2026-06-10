/**
 * Shared API contract types for the /api/analyze surface.
 *
 * These describe the JSON exchanged between the client API layer
 * (`client/src/lib/api.ts`) and the server route handlers
 * (`server/routes/analyze.ts`, `server/routes/pdf.ts`). Keep this file in
 * sync with the response built in `server/routes/analyze.ts`.
 */

export type CreditTier = 'excellent' | 'good' | 'fair' | 'poor';
export type FlagSeverity = 'critical' | 'warning';
export type MarketSource =
  | 'listings'
  | 'calculated'
  | 'msrp-data'
  | 'depreciation-model'
  | 'unknown';

/** A single dealer add-on / F&I product line item. */
export interface Addon {
  name: string;
  price: number;
}

/** Deal input sent to POST /api/analyze. */
export interface DealInput {
  year: number | string;
  make: string;
  model: string;
  trim?: string;
  condition?: string;
  mileage?: number | string;
  price: number | string;
  down?: number | string;
  tradeIn?: number | string;
  tradeOwed?: number | string;
  apr?: number | string;
  term?: number | string;
  creditTier?: CreditTier;
  zip?: string;
  addons?: Addon[];
}

/** One weighted scoring factor (see the scoring engine, max points vary). */
export interface ScoreFactor {
  name: string;
  points: number;
  max: number;
  note?: string;
  ratio?: number;
  apr?: number;
  fairApr?: number;
  docFee?: number;
  totalAddons?: number;
  term?: number;
  downRatio?: number;
}

/** A problem detected in the deal. */
export interface RedFlag {
  severity: FlagSeverity;
  title: string;
  detail: string;
  action?: string;
}

/** A positive signal in the deal. */
export interface GreenFlag {
  title: string;
  detail: string;
}

export interface Flags {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
}

/** A copy-paste negotiation script tied to a specific issue. */
export interface NegotiationScript {
  issue: string;
  script: string;
  source?: 'live-listings' | 'calculated';
}

/** A comparable market listing (from Auto.dev). */
export interface MarketListing {
  price: number | null;
  mileage: number | null;
  dealer: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  photoUrl: string | null;
  listingUrl: string | null;
  trim: string | null;
  baseMsrp: number | null;
  distanceMiles: number | null;
}

export interface PriceRange {
  low: number;
  high: number;
}

/**
 * Calculated/derived market reference (MSRP + depreciation model, or the
 * unified reference preferring live data). Used by score, flags, and scripts.
 */
export interface MarketCalc {
  source: MarketSource;
  estimated: number | null;
  low: number | null;
  high: number | null;
  baseMsrp: number | null;
  listingCount?: number;
  hasLiveData?: boolean;
  age?: number;
  depFactor?: number;
}

/** Live market data summary from Auto.dev (or a disabled placeholder). */
export interface MarketListings {
  enabled: boolean;
  avgPrice?: number | null;
  medianPrice?: number | null;
  listingCount?: number;
  priceRange?: PriceRange | null;
  listings?: MarketListing[];
  sampleListings?: MarketListing[];
  allListings?: MarketListing[];
  reason?: string;
}

/** Legal citation for a state's vehicle sales tax (tax-laws.json entry). */
export interface TaxLaw {
  statute?: string;
  [key: string]: unknown;
}

export interface Vehicle {
  year: number | string;
  make: string;
  model: string;
  trim?: string;
  condition?: string;
  conditionCorrected?: boolean;
  mileage?: number | string;
}

export interface EnteredDeal {
  price: number;
  down: number;
  tradeIn: number;
  tradeOwed: number;
  apr: number;
  term: number;
  creditTier: CreditTier;
  addons: Addon[];
}

export interface CalculatedDeal {
  state: string | null;
  taxRate: number;
  taxAmount: number;
  taxLaw: TaxLaw | null;
  docFee: number;
  docFeeLaw: string | null;
  docFeeCap: number | null;
  regFee: number;
  titleFee: number;
  totalAddons: number;
  totalCost: number;
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
}

/** Feature flags echoed back to the client. */
export interface Features {
  marketListings: boolean;
  vehiclePhotos: boolean;
  marketAverage: boolean;
}

/** Full response from POST /api/analyze. */
export interface DealAnalysisResponse {
  score: number;
  label: string;
  factors: ScoreFactor[];
  vehicle: Vehicle;
  entered: EnteredDeal;
  calculated: CalculatedDeal;
  market: {
    calculated: MarketCalc;
    listings: MarketListings | null;
    reference: MarketCalc;
  };
  features: Features;
  flags: Flags;
  scripts: NegotiationScript[];
}
