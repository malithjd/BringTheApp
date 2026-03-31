import { Router } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const taxRates = JSON.parse(readFileSync(path.join(__dirname, '../data/tax-rates.json'), 'utf-8'));
const taxLaws = JSON.parse(readFileSync(path.join(__dirname, '../data/tax-laws.json'), 'utf-8'));

// ZIP code to state mapping using USPS ranges
function zipToState(zip) {
  const z = parseInt(zip, 10);
  if (z >= 10 && z <= 27) return 'MA';
  if (z >= 28 && z <= 29) return 'RI';
  if (z >= 30 && z <= 38) return 'NH';
  if (z >= 40 && z <= 49) return 'ME';
  if (z >= 50 && z <= 59) return 'VT';
  if (z >= 60 && z <= 69) return 'CT';
  if (z >= 70 && z <= 89) return 'NJ';
  if (z >= 100 && z <= 149) return 'NY';
  if (z >= 150 && z <= 196) return 'PA';
  if (z >= 197 && z <= 199) return 'DE';
  if (z >= 200 && z <= 205) return 'DC';
  if (z >= 206 && z <= 219) return 'MD';
  if (z >= 220 && z <= 246) return 'VA';
  if (z >= 247 && z <= 268) return 'WV';
  if (z >= 270 && z <= 289) return 'NC';
  if (z >= 290 && z <= 299) return 'SC';
  if (z >= 300 && z <= 319) return 'GA';
  if (z >= 320 && z <= 339) return 'FL';
  if (z >= 350 && z <= 369) return 'AL';
  if (z >= 370 && z <= 385) return 'TN';
  if (z >= 386 && z <= 397) return 'MS';
  if (z >= 400 && z <= 427) return 'KY';
  if (z >= 430 && z <= 458) return 'OH';
  if (z >= 460 && z <= 479) return 'IN';
  if (z >= 480 && z <= 499) return 'MI';
  if (z >= 500 && z <= 528) return 'IA';
  if (z >= 530 && z <= 549) return 'WI';
  if (z >= 550 && z <= 567) return 'MN';
  if (z >= 570 && z <= 577) return 'SD';
  if (z >= 580 && z <= 588) return 'ND';
  if (z >= 590 && z <= 599) return 'MT';
  if (z >= 600 && z <= 629) return 'IL';
  if (z >= 630 && z <= 658) return 'MO';
  if (z >= 660 && z <= 679) return 'KS';
  if (z >= 680 && z <= 693) return 'NE';
  if (z >= 700 && z <= 714) return 'LA';
  if (z >= 716 && z <= 729) return 'AR';
  if (z >= 730 && z <= 749) return 'OK';
  if (z >= 750 && z <= 799) return 'TX';
  if (z >= 800 && z <= 816) return 'CO';
  if (z >= 820 && z <= 831) return 'WY';
  if (z >= 832 && z <= 838) return 'ID';
  if (z >= 840 && z <= 847) return 'UT';
  if (z >= 850 && z <= 865) return 'AZ';
  if (z >= 870 && z <= 884) return 'NM';
  if (z >= 889 && z <= 898) return 'NV';
  if (z >= 900 && z <= 961) return 'CA';
  if (z >= 967 && z <= 968) return 'HI';
  if (z >= 970 && z <= 979) return 'OR';
  if (z >= 980 && z <= 994) return 'WA';
  if (z >= 995 && z <= 999) return 'AK';
  return null;
}

// Check if NYC ZIP
function isNYC(zip) {
  const z = parseInt(zip, 10);
  return (z >= 100 && z <= 104) || (z >= 110 && z <= 119);
}

// GET /api/tax/:zip
router.get('/:zip', async (req, res) => {
  const { zip } = req.params;

  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Invalid ZIP code' });
  }

  const zipPrefix = Math.floor(parseInt(zip, 10) / 100);
  const state = zipToState(zipPrefix);

  if (!state) {
    return res.status(404).json({ error: 'Could not determine state from ZIP' });
  }

  // Try API Ninjas first
  if (process.env.API_NINJAS_KEY) {
    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/salestax?zip_code=${zip}`,
        { headers: { 'X-Api-Key': process.env.API_NINJAS_KEY } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const t = data[0];
          return res.json({
            state,
            zip,
            combinedRate: parseFloat(t.total_rate) || 0,
            stateRate: parseFloat(t.state_rate) || 0,
            countyRate: parseFloat(t.county_rate) || 0,
            cityRate: parseFloat(t.city_rate) || 0,
            source: 'api-ninjas',
            law: taxLaws[state] || null,
          });
        }
      }
    } catch (err) {
      console.error('API Ninjas error, falling back to local data:', err.message);
    }
  }

  // Fallback to local data
  const stateData = taxRates[state];
  if (!stateData) {
    return res.status(404).json({ error: `No tax data for state ${state}` });
  }

  let combinedRate = stateData.stateRate + stateData.avgLocalRate;

  // NYC special handling
  if (state === 'NY' && isNYC(zip)) {
    combinedRate = 0.08875;
  }

  res.json({
    state,
    zip,
    combinedRate,
    stateRate: stateData.stateRate,
    localRate: stateData.avgLocalRate,
    note: stateData.note || null,
    source: 'local-estimate',
    law: taxLaws[state] || null,
  });
});

export { zipToState };
export default router;
