import { Router } from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

const router = Router();

// ---------------------------------------------------------------------------
// Multer config – memory storage, up to 10 files, 10 MB each
// ---------------------------------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ---------------------------------------------------------------------------
// Image preprocessing – resize to max 1500 px long edge, JPEG 85 %
// ---------------------------------------------------------------------------
async function preprocessImage(buffer) {
  const meta = await sharp(buffer).metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);
  let pipeline = sharp(buffer);
  if (longest > 1500) {
    pipeline = pipeline.resize({
      width: (meta.width || 0) >= (meta.height || 0) ? 1500 : undefined,
      height: (meta.height || 0) > (meta.width || 0) ? 1500 : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  return pipeline.jpeg({ quality: 85 }).toBuffer();
}

// ---------------------------------------------------------------------------
// Tool schema – extract_deal_data
// ---------------------------------------------------------------------------
const EXTRACT_DEAL_DATA_TOOL = {
  name: 'extract_deal_data',
  description:
    'Extract structured deal data from automotive deal documents. Call this tool exactly once with all extracted information.',
  input_schema: {
    type: 'object',
    properties: {
      vehicle: {
        type: 'object',
        properties: {
          year: { type: ['string', 'null'] },
          make: { type: ['string', 'null'] },
          model: { type: ['string', 'null'] },
          trim: { type: ['string', 'null'] },
          vin: { type: ['string', 'null'] },
          stock_number: { type: ['string', 'null'] },
          exterior_color: { type: ['string', 'null'] },
          interior_color: { type: ['string', 'null'] },
          mileage: { type: ['number', 'null'] },
          condition: {
            type: ['string', 'null'],
            enum: ['new', 'used', null],
          },
        },
        required: [
          'year', 'make', 'model', 'trim', 'vin', 'stock_number',
          'exterior_color', 'interior_color', 'mileage', 'condition',
        ],
      },
      pricing: {
        type: 'object',
        properties: {
          msrp: { type: ['number', 'null'] },
          selling_price: { type: ['number', 'null'] },
          rebates_incentives: { type: ['number', 'null'] },
          doc_fee: { type: ['number', 'null'] },
          sales_tax: { type: ['number', 'null'] },
          title_fee: { type: ['number', 'null'] },
          registration_fee: { type: ['number', 'null'] },
          total_price: { type: ['number', 'null'] },
          destination_charge: { type: ['number', 'null'] },
        },
        required: [
          'msrp', 'selling_price', 'rebates_incentives', 'doc_fee',
          'sales_tax', 'title_fee', 'registration_fee', 'total_price',
          'destination_charge',
        ],
      },
      trade_in: {
        type: ['object', 'null'],
        properties: {
          year: { type: ['string', 'null'] },
          make: { type: ['string', 'null'] },
          model: { type: ['string', 'null'] },
          vin: { type: ['string', 'null'] },
          gross_trade_value: { type: ['number', 'null'] },
          payoff_amount: { type: ['number', 'null'] },
          net_trade_value: { type: ['number', 'null'] },
        },
        required: [
          'year', 'make', 'model', 'vin', 'gross_trade_value',
          'payoff_amount', 'net_trade_value',
        ],
      },
      financing: {
        type: ['object', 'null'],
        properties: {
          amount_financed: { type: ['number', 'null'] },
          apr: { type: ['number', 'null'] },
          term_months: { type: ['number', 'null'] },
          monthly_payment: { type: ['number', 'null'] },
          lender: { type: ['string', 'null'] },
          down_payment: { type: ['number', 'null'] },
          finance_charge: { type: ['number', 'null'] },
        },
        required: [
          'amount_financed', 'apr', 'term_months', 'monthly_payment',
          'lender', 'down_payment', 'finance_charge',
        ],
      },
      factory_options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            code: { type: ['string', 'null'] },
            description: { type: 'string' },
            price: { type: ['number', 'null'] },
          },
          required: ['description'],
        },
      },
      dealer_addons: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            price: { type: ['number', 'null'] },
          },
          required: ['description'],
        },
      },
      aftermarket_products: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            provider: { type: ['string', 'null'] },
            price: { type: ['number', 'null'] },
            term_months: { type: ['number', 'null'] },
          },
          required: ['type'],
        },
      },
      raw_text_summary: { type: 'string' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      conflicts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            values: { type: 'array', items: { type: ['string', 'number'] } },
            sources: { type: 'array', items: { type: 'string' } },
          },
          required: ['field', 'values', 'sources'],
        },
      },
    },
    required: [
      'vehicle', 'pricing', 'trade_in', 'financing',
      'factory_options', 'dealer_addons', 'aftermarket_products',
      'raw_text_summary', 'confidence', 'conflicts',
    ],
  },
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an expert automotive deal document analyst. You will receive one or more images of automotive deal documents — these may include buyer's orders, retail installment contracts (finance agreements), window stickers (Monroney stickers), credit applications, trade-in appraisals, or F&I product menus.

Your job is to extract every piece of structured deal data visible across ALL pages and return it via the extract_deal_data tool. Follow these rules precisely:

DOCUMENT IDENTIFICATION
- First identify each document page type (buyer's order, finance agreement, window sticker, etc.) and note it in your raw_text_summary.
- Different pages may overlap in the data they contain. Cross-reference them.

FACTORY OPTIONS vs DEALER ADD-ONS vs AFTERMARKET/F&I PRODUCTS
- Factory options appear on the window sticker / Monroney label. They have manufacturer option codes (e.g., "2TB", "PXR") and are installed at the factory. Extract these into factory_options.
- Dealer add-ons are items the DEALER installed or added AFTER the vehicle left the factory — nitrogen tire fill, door edge guards, wheel locks, pinstripes, window tint, dealer appearance packages, etc. Extract these into dealer_addons.
- Aftermarket / F&I products are sold in the Finance & Insurance office — GAP insurance, extended warranty / vehicle service contract, paint protection film/coating, fabric protection, tire & wheel protection, theft deterrent / LoJack, prepaid maintenance plans, key replacement, dent repair, windshield protection. Extract these into aftermarket_products with their type, provider name if shown, price, and coverage term in months.

PRICING RULES
- For APR, term, monthly payment, amount financed, and finance charge: PREFER the finance agreement / retail installment contract over the buyer's order, because the finance agreement is the binding document.
- MSRP should come from the window sticker if available; selling price from the buyer's order.
- If the same field appears with DIFFERENT values on different pages, record both in the conflicts array.

DATA QUALITY
- Return null for any field you cannot clearly read. NEVER guess or hallucinate values.
- VINs are exactly 17 characters: digits and uppercase letters excluding I, O, Q.
- Dollar amounts should be plain numbers (no $ sign, no commas).
- APR should be the numeric percentage value (e.g., 5.99 not 0.0599).

Always call the extract_deal_data tool exactly once with your complete extraction.`;

// ---------------------------------------------------------------------------
// Map rich extraction to simplified form-compatible fields (matches legacy parseOcrText output)
// ---------------------------------------------------------------------------
function mapToFormFields(extracted) {
  const f = {};

  // Vehicle basics
  if (extracted.vehicle) {
    const v = extracted.vehicle;
    if (v.vin) f.vin = v.vin;
    if (v.year) f.year = String(v.year);
    if (v.make) f.make = v.make;
    if (v.model) f.model = v.model;
    if (v.trim) f.trim = v.trim;
    if (v.mileage != null) f.mileage = v.mileage;
    if (v.condition) f.condition = v.condition;
  }

  // Pricing
  if (extracted.pricing) {
    const p = extracted.pricing;
    if (p.selling_price != null) f.price = p.selling_price;
    if (p.msrp != null) f.msrp = p.msrp;
    if (p.doc_fee != null) f.docFee = p.doc_fee;
    if (p.sales_tax != null) f.taxAmount = p.sales_tax;
    if (p.registration_fee != null) f.regFee = p.registration_fee;
    if (p.title_fee != null) f.titleFee = p.title_fee;
  }

  // Trade-in
  if (extracted.trade_in) {
    const t = extracted.trade_in;
    if (t.gross_trade_value != null) f.tradeIn = t.gross_trade_value;
    if (t.payoff_amount != null) f.tradeOwed = t.payoff_amount;
  }

  // Financing
  if (extracted.financing) {
    const fin = extracted.financing;
    if (fin.apr != null) f.apr = fin.apr;
    if (fin.term_months != null) f.term = fin.term_months;
    if (fin.monthly_payment != null) f.monthlyPayment = fin.monthly_payment;
    if (fin.down_payment != null) f.down = fin.down_payment;
  }

  // Add-ons (combine dealer_addons + aftermarket_products for legacy format)
  const addons = [];
  if (extracted.dealer_addons) {
    for (const a of extracted.dealer_addons) {
      addons.push({ name: a.description, price: a.price ?? 0, enabled: true });
    }
  }
  if (extracted.aftermarket_products) {
    for (const a of extracted.aftermarket_products) {
      addons.push({ name: a.type, price: a.price ?? 0, enabled: true });
    }
  }
  if (addons.length > 0) f.addons = addons;

  // Factory options (separate from add-ons — these are part of MSRP)
  if (extracted.factory_options?.length > 0) {
    f.factoryOptions = extracted.factory_options.map(o => ({
      code: o.code || '',
      description: o.description,
      price: o.price ?? 0,
    }));
  }

  return f;
}

// ---------------------------------------------------------------------------
// NHTSA vPIC VIN decode helper
// ---------------------------------------------------------------------------
async function nhtsaVinDecode(vin) {
  try {
    const resp = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
    );
    const data = await resp.json();
    return data.Results?.[0] || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// POST /api/ocr/extract – Claude Vision extraction
// ---------------------------------------------------------------------------
router.post('/extract', upload.array('documents', 10), async (req, res) => {
  try {
    // ----- Validate API key -----
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'ANTHROPIC_API_KEY is not configured. Set the ANTHROPIC_API_KEY environment variable to use Claude Vision OCR extraction.',
      });
    }

    // ----- Collect image buffers from uploads + base64 body -----
    const imageBuffers = [];

    // From file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        imageBuffers.push({ buffer: file.buffer, source: file.originalname });
      }
    }

    // From base64 array in body
    if (req.body.images && Array.isArray(req.body.images)) {
      for (let i = 0; i < req.body.images.length; i++) {
        const raw = req.body.images[i];
        const b64 = raw.replace(/^data:image\/\w+;base64,/, '');
        imageBuffers.push({
          buffer: Buffer.from(b64, 'base64'),
          source: `camera_capture_${i + 1}`,
        });
      }
    }

    if (imageBuffers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No documents provided. Upload files via "documents" field or send base64 images in "images" array.',
      });
    }

    // ----- Preprocess images -----
    const processedImages = [];
    for (const img of imageBuffers) {
      try {
        const jpegBuf = await preprocessImage(img.buffer);
        processedImages.push({
          base64: jpegBuf.toString('base64'),
          source: img.source,
        });
      } catch (err) {
        console.warn(`Skipping image ${img.source}: preprocessing failed –`, err.message);
      }
    }

    if (processedImages.length === 0) {
      return res.status(422).json({
        success: false,
        error: 'All provided images failed preprocessing. Ensure they are valid image files.',
      });
    }

    // ----- Build Claude messages content array -----
    const content = [];
    for (let i = 0; i < processedImages.length; i++) {
      content.push({
        type: 'text',
        text: `Document page ${i + 1}:`,
      });
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: processedImages[i].base64,
        },
      });
    }

    content.push({
      type: 'text',
      text: 'Please analyze all document pages above and extract the deal data using the extract_deal_data tool.',
    });

    // ----- Call Claude API -----
    const client = new Anthropic({ apiKey });
    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [EXTRACT_DEAL_DATA_TOOL],
      tool_choice: { type: 'tool', name: 'extract_deal_data' },
      messages: [{ role: 'user', content }],
    }, { timeout: 60000 });

    // ----- Extract tool_use result -----
    const toolBlock = response.content.find((b) => b.type === 'tool_use');
    if (!toolBlock) {
      return res.status(422).json({
        success: false,
        error: 'Claude did not return structured extraction. Try again or use /api/ocr/parse-legacy.',
      });
    }

    const extracted = toolBlock.input;

    // ----- NHTSA VIN cross-reference -----
    if (extracted.vehicle?.vin) {
      const nhtsa = await nhtsaVinDecode(extracted.vehicle.vin);
      if (nhtsa) {
        if (!extracted.vehicle.year && nhtsa.ModelYear) extracted.vehicle.year = nhtsa.ModelYear;
        if (!extracted.vehicle.make && nhtsa.Make) extracted.vehicle.make = nhtsa.Make;
        if (!extracted.vehicle.model && nhtsa.Model) extracted.vehicle.model = nhtsa.Model;
        if (!extracted.vehicle.trim && nhtsa.Trim) extracted.vehicle.trim = nhtsa.Trim;
      }
    }

    // ----- Map to form fields -----
    const fields = mapToFormFields(extracted);
    const fieldCount =
      Object.keys(fields).filter((k) => k !== 'addons').length +
      (fields.addons?.length || 0);

    return res.json({
      success: true,
      extracted,
      fields,
      fieldCount,
      message: `Extracted ${fieldCount} fields from ${processedImages.length} document page${processedImages.length > 1 ? 's' : ''}`,
      documentsProcessed: processedImages.length,
    });
  } catch (err) {
    console.error('OCR extract error:', err);
    return res.status(500).json({
      success: false,
      error: 'OCR extraction failed',
      message: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// Legacy parseOcrText (kept for /parse-legacy fallback)
// ---------------------------------------------------------------------------
function parseOcrText(text) {
  const fields = {};
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  const vinMatch = fullText.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
  if (vinMatch) fields.vin = vinMatch[1].toUpperCase();

  const yearMatch = fullText.match(/\b(20[1-2]\d)\b/);
  if (yearMatch) fields.year = yearMatch[1];

  const pricePatterns = [
    /(?:selling\s*price|vehicle\s*price|cash\s*price|sale\s*price|purchase\s*price)[:\s]*\$?([\d,]+\.?\d*)/i,
    /(?:total\s*vehicle\s*price)[:\s]*\$?([\d,]+\.?\d*)/i,
    /(?:price\s*of\s*vehicle)[:\s]*\$?([\d,]+\.?\d*)/i,
  ];
  for (const pat of pricePatterns) {
    const match = fullText.match(pat);
    if (match) {
      fields.price = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  const msrpMatch = fullText.match(/(?:MSRP|sticker\s*price|manufacturer.*suggested)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (msrpMatch) fields.msrp = parseFloat(msrpMatch[1].replace(/,/g, ''));

  const downMatch = fullText.match(/(?:down\s*payment|cash\s*down|deposit)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (downMatch) fields.down = parseFloat(downMatch[1].replace(/,/g, ''));

  const tradeMatch = fullText.match(/(?:trade[\s-]*in\s*(?:value|allowance)?)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (tradeMatch) fields.tradeIn = parseFloat(tradeMatch[1].replace(/,/g, ''));

  const tradeOwedMatch = fullText.match(/(?:trade[\s-]*in\s*(?:payoff|owed|balance)|payoff\s*amount)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (tradeOwedMatch) fields.tradeOwed = parseFloat(tradeOwedMatch[1].replace(/,/g, ''));

  const aprMatch = fullText.match(/(?:APR|annual\s*percentage\s*rate|interest\s*rate)[:\s]*([\d]+\.?\d*)\s*%?/i);
  if (aprMatch) fields.apr = parseFloat(aprMatch[1]);

  const termMatch = fullText.match(/(?:term|number\s*of\s*(?:payments|months))[:\s]*(\d+)\s*(?:months?|mo\.?)?/i);
  if (termMatch) fields.term = parseInt(termMatch[1]);

  const paymentMatch = fullText.match(/(?:monthly\s*payment|payment\s*amount|amount\s*financed.*?payment)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (paymentMatch) fields.monthlyPayment = parseFloat(paymentMatch[1].replace(/,/g, ''));

  const docFeeMatch = fullText.match(/(?:doc(?:ument(?:ation)?)?\.?\s*fee|dealer\s*fee)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (docFeeMatch) fields.docFee = parseFloat(docFeeMatch[1].replace(/,/g, ''));

  const taxMatch = fullText.match(/(?:sales?\s*tax|state\s*tax|tax\s*amount)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (taxMatch) fields.taxAmount = parseFloat(taxMatch[1].replace(/,/g, ''));

  const regMatch = fullText.match(/(?:registration|reg\.?\s*fee|license\s*fee)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (regMatch) fields.regFee = parseFloat(regMatch[1].replace(/,/g, ''));

  const titleMatch = fullText.match(/(?:title\s*fee|title)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (titleMatch) fields.titleFee = parseFloat(titleMatch[1].replace(/,/g, ''));

  const mileageMatch = fullText.match(/(?:mileage|odometer|miles)[:\s]*([\d,]+)/i);
  if (mileageMatch) fields.mileage = parseInt(mileageMatch[1].replace(/,/g, ''));

  if (/\bnew\b/i.test(fullText)) fields.condition = 'new';
  else if (/\bused\b|\bpre[\s-]*owned\b|\bcertified\b/i.test(fullText)) fields.condition = 'used';

  const vehicleLinePatterns = [
    /(?:vehicle|description|stock)[:\s]*\d*\s*(\d{4})\s+(\w+)\s+(.+?)(?:\s+VIN|\s+Stock|\s*$)/im,
    /(\d{4})\s+(Toyota|Honda|Ford|Chevrolet|Chevy|Nissan|Hyundai|Kia|BMW|Mercedes|Audi|Tesla|Subaru|VW|Volkswagen|Jeep|Ram|GMC|Dodge|Lexus|Mazda|Acura)\s+(\S+(?:\s+\S+)?)/i,
  ];
  for (const pat of vehicleLinePatterns) {
    const match = fullText.match(pat);
    if (match) {
      if (!fields.year) fields.year = match[1];
      fields.make = match[2];
      fields.model = match[3]?.trim();
      break;
    }
  }

  const addonPatterns = [
    { name: 'GAP Insurance', pattern: /GAP\s*(?:insurance|coverage|protection)?[:\s]*\$?([\d,]+\.?\d*)/i },
    { name: 'Extended Warranty', pattern: /(?:extended|vehicle\s*service)\s*(?:warranty|contract|protection)[:\s]*\$?([\d,]+\.?\d*)/i },
    { name: 'Paint Protection', pattern: /paint\s*(?:protection|sealant|coating)[:\s]*\$?([\d,]+\.?\d*)/i },
    { name: 'Fabric Protection', pattern: /fabric\s*(?:protection|guard)[:\s]*\$?([\d,]+\.?\d*)/i },
    { name: 'Tire & Wheel', pattern: /tire\s*(?:&|and)\s*wheel[:\s]*\$?([\d,]+\.?\d*)/i },
    { name: 'LoJack', pattern: /(?:lojack|theft\s*(?:protection|deterrent|guard))[:\s]*\$?([\d,]+\.?\d*)/i },
    { name: 'Window Tint', pattern: /(?:window\s*tint|tint(?:ing)?)[:\s]*\$?([\d,]+\.?\d*)/i },
    { name: 'Maintenance Plan', pattern: /(?:maintenance|service)\s*(?:plan|package)[:\s]*\$?([\d,]+\.?\d*)/i },
  ];

  const addons = [];
  for (const { name, pattern } of addonPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      addons.push({ name, price: parseFloat(match[1].replace(/,/g, '')), enabled: true });
    }
  }
  if (addons.length > 0) fields.addons = addons;

  return fields;
}

// ---------------------------------------------------------------------------
// POST /api/ocr/parse-legacy – original OCR.space approach (fallback)
// ---------------------------------------------------------------------------
router.post('/parse-legacy', upload.single('document'), async (req, res) => {
  try {
    let imageData;

    if (req.file) {
      imageData = req.file.buffer.toString('base64');
    } else if (req.body.base64) {
      imageData = req.body.base64.replace(/^data:image\/\w+;base64,/, '');
    } else {
      return res.status(400).json({ error: 'No document provided' });
    }

    const ocrKey = process.env.OCR_SPACE_KEY;
    if (!ocrKey) {
      return res.status(500).json({ error: 'OCR API key not configured' });
    }

    const formData = new URLSearchParams();
    formData.append('base64Image', `data:image/jpeg;base64,${imageData}`);
    formData.append('OCREngine', '2');
    formData.append('isTable', 'true');
    formData.append('scale', 'true');
    formData.append('detectOrientation', 'true');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { apikey: ocrKey },
      body: formData,
    });

    const ocrResult = await ocrResponse.json();

    if (ocrResult.IsErroredOnProcessing) {
      return res.status(422).json({
        error: 'OCR processing failed',
        message: ocrResult.ErrorMessage?.[0] || 'Unknown error',
        fallback: true,
      });
    }

    const parsedText = ocrResult.ParsedResults?.map((r) => r.ParsedText).join('\n') || '';

    if (!parsedText.trim()) {
      return res.json({
        success: false,
        rawText: '',
        fields: {},
        message: 'Could not extract text from document. Please enter details manually.',
        fallback: true,
      });
    }

    const fields = parseOcrText(parsedText);

    if (fields.vin && (!fields.make || !fields.model)) {
      const nhtsa = await nhtsaVinDecode(fields.vin);
      if (nhtsa) {
        if (!fields.year && nhtsa.ModelYear) fields.year = nhtsa.ModelYear;
        if (!fields.make && nhtsa.Make) fields.make = nhtsa.Make;
        if (!fields.model && nhtsa.Model) fields.model = nhtsa.Model;
        if (nhtsa.Trim) fields.trim = nhtsa.Trim;
      }
    }

    const fieldCount =
      Object.keys(fields).filter((k) => k !== 'addons').length +
      (fields.addons?.length || 0);

    res.json({
      success: fieldCount > 0,
      rawText: parsedText,
      fields,
      fieldCount,
      message: fieldCount > 0
        ? `Extracted ${fieldCount} fields from document. Please review and correct any errors.`
        : 'Could not identify deal fields. Please enter details manually.',
      fallback: fieldCount === 0,
    });
  } catch (err) {
    console.error('OCR legacy error:', err);
    res.status(500).json({ error: 'OCR processing failed', message: err.message });
  }
});

export default router;
