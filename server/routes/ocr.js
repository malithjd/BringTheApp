import { Router } from 'express';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Parse OCR text into deal fields
function parseOcrText(text) {
  const fields = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  // VIN (17 alphanumeric, no I/O/Q)
  const vinMatch = fullText.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
  if (vinMatch) fields.vin = vinMatch[1].toUpperCase();

  // Year
  const yearMatch = fullText.match(/\b(20[1-2]\d)\b/);
  if (yearMatch) fields.year = yearMatch[1];

  // Price patterns - look for selling price, vehicle price, cash price
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

  // MSRP
  const msrpMatch = fullText.match(/(?:MSRP|sticker\s*price|manufacturer.*suggested)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (msrpMatch) fields.msrp = parseFloat(msrpMatch[1].replace(/,/g, ''));

  // Down payment
  const downMatch = fullText.match(/(?:down\s*payment|cash\s*down|deposit)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (downMatch) fields.down = parseFloat(downMatch[1].replace(/,/g, ''));

  // Trade-in
  const tradeMatch = fullText.match(/(?:trade[\s-]*in\s*(?:value|allowance)?)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (tradeMatch) fields.tradeIn = parseFloat(tradeMatch[1].replace(/,/g, ''));

  // Trade owed / payoff
  const tradeOwedMatch = fullText.match(/(?:trade[\s-]*in\s*(?:payoff|owed|balance)|payoff\s*amount)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (tradeOwedMatch) fields.tradeOwed = parseFloat(tradeOwedMatch[1].replace(/,/g, ''));

  // APR
  const aprMatch = fullText.match(/(?:APR|annual\s*percentage\s*rate|interest\s*rate)[:\s]*([\d]+\.?\d*)\s*%?/i);
  if (aprMatch) fields.apr = parseFloat(aprMatch[1]);

  // Term / months
  const termMatch = fullText.match(/(?:term|number\s*of\s*(?:payments|months))[:\s]*(\d+)\s*(?:months?|mo\.?)?/i);
  if (termMatch) fields.term = parseInt(termMatch[1]);

  // Monthly payment
  const paymentMatch = fullText.match(/(?:monthly\s*payment|payment\s*amount|amount\s*financed.*?payment)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (paymentMatch) fields.monthlyPayment = parseFloat(paymentMatch[1].replace(/,/g, ''));

  // Doc fee
  const docFeeMatch = fullText.match(/(?:doc(?:ument(?:ation)?)?\.?\s*fee|dealer\s*fee)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (docFeeMatch) fields.docFee = parseFloat(docFeeMatch[1].replace(/,/g, ''));

  // Sales tax
  const taxMatch = fullText.match(/(?:sales?\s*tax|state\s*tax|tax\s*amount)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (taxMatch) fields.taxAmount = parseFloat(taxMatch[1].replace(/,/g, ''));

  // Registration
  const regMatch = fullText.match(/(?:registration|reg\.?\s*fee|license\s*fee)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (regMatch) fields.regFee = parseFloat(regMatch[1].replace(/,/g, ''));

  // Title
  const titleMatch = fullText.match(/(?:title\s*fee|title)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (titleMatch) fields.titleFee = parseFloat(titleMatch[1].replace(/,/g, ''));

  // Mileage / Odometer
  const mileageMatch = fullText.match(/(?:mileage|odometer|miles)[:\s]*([\d,]+)/i);
  if (mileageMatch) fields.mileage = parseInt(mileageMatch[1].replace(/,/g, ''));

  // New / Used
  if (/\bnew\b/i.test(fullText)) fields.condition = 'new';
  else if (/\bused\b|\bpre[\s-]*owned\b|\bcertified\b/i.test(fullText)) fields.condition = 'used';

  // Make/Model extraction (common patterns on buyer's orders)
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

  // Common add-ons detection
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

// POST /api/ocr/parse
router.post('/parse', upload.single('document'), async (req, res) => {
  try {
    let imageData;
    let filename;

    if (req.file) {
      // File upload
      imageData = req.file.buffer.toString('base64');
      filename = req.file.originalname;
    } else if (req.body.base64) {
      // Base64 data from camera capture
      imageData = req.body.base64.replace(/^data:image\/\w+;base64,/, '');
      filename = 'capture.jpg';
    } else {
      return res.status(400).json({ error: 'No document provided' });
    }

    const ocrKey = process.env.OCR_SPACE_KEY;
    if (!ocrKey) {
      return res.status(500).json({ error: 'OCR API key not configured' });
    }

    // Call OCR.space API
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

    const parsedText = ocrResult.ParsedResults?.map(r => r.ParsedText).join('\n') || '';

    if (!parsedText.trim()) {
      return res.json({
        success: false,
        rawText: '',
        fields: {},
        message: 'Could not extract text from document. Please enter details manually.',
        fallback: true,
      });
    }

    // Parse the OCR text into structured fields
    const fields = parseOcrText(parsedText);

    // If we found a VIN but no make/model, try NHTSA decode
    if (fields.vin && (!fields.make || !fields.model)) {
      try {
        const vinResponse = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${fields.vin}?format=json`
        );
        const vinData = await vinResponse.json();
        const result = vinData.Results?.[0];
        if (result) {
          if (!fields.year && result.ModelYear) fields.year = result.ModelYear;
          if (!fields.make && result.Make) fields.make = result.Make;
          if (!fields.model && result.Model) fields.model = result.Model;
          if (result.Trim) fields.trim = result.Trim;
        }
      } catch (e) {
        // VIN decode failed, that's ok
      }
    }

    const fieldCount = Object.keys(fields).filter(k => k !== 'addons').length + (fields.addons?.length || 0);

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
    console.error('OCR error:', err);
    res.status(500).json({ error: 'OCR processing failed', message: err.message });
  }
});

export default router;
