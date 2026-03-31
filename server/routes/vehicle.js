import { Router } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const msrpData = JSON.parse(readFileSync(path.join(__dirname, '../data/vehicle-msrp.json'), 'utf-8'));

// GET /api/vehicle/makes
router.get('/makes', async (req, res) => {
  try {
    const response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json');
    const data = await response.json();
    const makes = data.Results.map(m => ({
      id: m.Make_ID,
      name: m.Make_Name,
    })).sort((a, b) => a.name.localeCompare(b.name));
    res.json(makes);
  } catch (err) {
    // Fallback to MSRP data keys
    const makes = [...new Set(Object.keys(msrpData).map(k => k.split(' ')[0]))].sort();
    res.json(makes.map((name, i) => ({ id: i, name })));
  }
});

// GET /api/vehicle/models/:make/:year
router.get('/models/:make/:year', async (req, res) => {
  const { make, year } = req.params;
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
    );
    const data = await response.json();
    const models = data.Results.map(m => ({
      id: m.Model_ID,
      name: m.Model_Name,
    })).sort((a, b) => a.name.localeCompare(b.name));
    res.json(models);
  } catch (err) {
    res.json([]);
  }
});

// GET /api/vehicle/trims/:make/:model/:year
router.get('/trims/:make/:model/:year', (req, res) => {
  const { make, model, year } = req.params;

  // Search MSRP data for matching vehicle
  const key = findMsrpKey(make, model);
  if (key && msrpData[key] && msrpData[key][year]) {
    const trims = Object.keys(msrpData[key][year]);
    res.json(trims);
  } else {
    res.json([]);
  }
});

// GET /api/vehicle/vin/:vin
router.get('/vin/:vin', async (req, res) => {
  const { vin } = req.params;
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    return res.status(400).json({ error: 'Invalid VIN format' });
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`
    );
    const data = await response.json();
    const result = data.Results[0];

    res.json({
      year: result.ModelYear,
      make: result.Make,
      model: result.Model,
      trim: result.Trim,
      bodyClass: result.BodyClass,
      driveType: result.DriveType,
      fuelType: result.FuelTypePrimary,
      engineCylinders: result.EngineCylinders,
      displacementL: result.DisplacementL,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decode VIN' });
  }
});

// GET /api/vehicle/msrp/:make/:model/:year (and with optional trim)
router.get('/msrp/:make/:model/:year/:trim', msrpHandler);
router.get('/msrp/:make/:model/:year', msrpHandler);

function msrpHandler(req, res) {
  const { make, model, year, trim } = req.params;
  const key = findMsrpKey(make, model);

  if (!key || !msrpData[key]) {
    return res.json({ found: false, msrp: null });
  }

  const yearData = msrpData[key][year];
  if (!yearData) {
    // Try to extrapolate from nearest year
    const years = Object.keys(msrpData[key]).map(Number).sort();
    const nearest = years.reduce((prev, curr) =>
      Math.abs(curr - parseInt(year)) < Math.abs(prev - parseInt(year)) ? curr : prev
    );
    const nearestData = msrpData[key][String(nearest)];
    if (nearestData) {
      const trims = Object.keys(nearestData);
      const baseTrim = trims[0];
      const baseMsrp = nearestData[baseTrim];
      return res.json({
        found: true,
        approximate: true,
        baseMsrp,
        trims: nearestData,
        matchedYear: nearest,
      });
    }
    return res.json({ found: false, msrp: null });
  }

  if (trim) {
    const trimKey = findTrimKey(yearData, trim);
    if (trimKey) {
      return res.json({
        found: true,
        msrp: yearData[trimKey],
        trim: trimKey,
        allTrims: yearData,
      });
    }
  }

  // Return base (first) trim MSRP
  const trims = Object.keys(yearData);
  res.json({
    found: true,
    msrp: yearData[trims[0]],
    baseTrim: trims[0],
    allTrims: yearData,
  });
}

function findMsrpKey(make, model) {
  const search = `${make} ${model}`.toLowerCase();
  return Object.keys(msrpData).find(k => k.toLowerCase() === search)
    || Object.keys(msrpData).find(k => k.toLowerCase().includes(model.toLowerCase()) && k.toLowerCase().includes(make.toLowerCase()));
}

function findTrimKey(yearData, trim) {
  const t = trim.toLowerCase();
  return Object.keys(yearData).find(k => k.toLowerCase() === t)
    || Object.keys(yearData).find(k => k.toLowerCase().includes(t) || t.includes(k.toLowerCase()));
}

export { findMsrpKey, msrpData };
export default router;
