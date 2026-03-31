#!/usr/bin/env node

/**
 * update-data.js — Refresh data files for BringTheApp
 *
 * Usage: node scripts/update-data.js
 *
 * - Fetches latest tax rates from API Ninjas for state capitals
 * - Verifies doc fee caps
 * - Logs what changed since last update
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const DATA_DIR = path.join(__dirname, '../data');

// State capital ZIP codes for tax rate lookups
const STATE_CAPITAL_ZIPS = {
  AL: '36101', AK: '99801', AZ: '85001', AR: '72201', CA: '95814',
  CO: '80202', CT: '06103', DE: '19901', DC: '20001', FL: '32301',
  GA: '30301', HI: '96813', ID: '83702', IL: '62701', IN: '46204',
  IA: '50309', KS: '66603', KY: '40601', LA: '70801', ME: '04330',
  MD: '21401', MA: '02108', MI: '48933', MN: '55101', MS: '39201',
  MO: '65101', MT: '59601', NE: '68502', NV: '89701', NH: '03301',
  NJ: '08608', NM: '87501', NY: '12207', NC: '27601', ND: '58501',
  OH: '43215', OK: '73101', OR: '97301', PA: '17101', RI: '02903',
  SC: '29201', SD: '57501', TN: '37201', TX: '78701', UT: '84101',
  VT: '05602', VA: '23219', WA: '98501', WV: '25301', WI: '53703',
  WY: '82001',
};

const DOC_FEE_CAPS = {
  AR: { cap: 129, law: 'Ark. Code §23-112-1001' },
  CA: { cap: 85, law: 'CA Civil Code §4456.5' },
  IL: { cap: 321.57, law: '815 ILCS 306/1' },
  MN: { cap: 125, law: 'MN Stat. §168.27' },
  NY: { cap: 175, law: 'NY VTL §398-f' },
  TX: { cap: 150, law: 'TX Occ. Code §2301.553' },
  VA: { cap: 599, law: 'VA Code §46.2-1530' },
  WA: { cap: 200, law: 'RCW §46.17.025(1)(b)' },
};

async function fetchTaxRate(zip) {
  const apiKey = process.env.API_NINJAS_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.api-ninjas.com/v1/salestax?zip_code=${zip}`, {
      headers: { 'X-Api-Key': apiKey },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  } catch {
    return null;
  }
}

async function updateTaxRates() {
  console.log('\n--- Updating Tax Rates ---');
  const currentFile = path.join(DATA_DIR, 'tax-rates.json');
  const current = JSON.parse(readFileSync(currentFile, 'utf-8'));
  let changes = 0;

  for (const [state, zip] of Object.entries(STATE_CAPITAL_ZIPS)) {
    const data = await fetchTaxRate(zip);
    if (!data) {
      console.log(`  [SKIP] ${state}: No API response`);
      continue;
    }

    const newStateRate = parseFloat(data.state_rate) || 0;
    const newLocalRate = (parseFloat(data.county_rate) || 0) + (parseFloat(data.city_rate) || 0);

    if (current[state]) {
      const oldState = current[state].stateRate;
      const oldLocal = current[state].avgLocalRate;

      if (Math.abs(newStateRate - oldState) > 0.001 || Math.abs(newLocalRate - oldLocal) > 0.005) {
        console.log(`  [CHANGED] ${state}: state ${oldState} -> ${newStateRate}, local ${oldLocal} -> ${newLocalRate}`);
        current[state].stateRate = newStateRate;
        current[state].avgLocalRate = newLocalRate;
        changes++;
      }
    }

    // Rate limit: 1 request per 100ms
    await new Promise(r => setTimeout(r, 100));
  }

  if (changes > 0) {
    writeFileSync(currentFile, JSON.stringify(current, null, 2));
    console.log(`  Updated ${changes} state tax rates.`);
  } else {
    console.log('  No tax rate changes detected.');
  }
}

function verifyDocFeeCaps() {
  console.log('\n--- Verifying Doc Fee Caps ---');
  const feesFile = path.join(DATA_DIR, 'state-fees.json');
  const fees = JSON.parse(readFileSync(feesFile, 'utf-8'));
  let issues = 0;

  for (const [state, expected] of Object.entries(DOC_FEE_CAPS)) {
    const actual = fees[state]?.docFee;
    if (!actual) {
      console.log(`  [MISSING] ${state}: No doc fee data`);
      issues++;
      continue;
    }

    if (!actual.capped) {
      console.log(`  [ISSUE] ${state}: Should be capped but isn't flagged`);
      issues++;
    } else if (actual.cap !== expected.cap) {
      console.log(`  [MISMATCH] ${state}: Cap is $${actual.cap}, expected $${expected.cap}`);
      issues++;
    } else {
      console.log(`  [OK] ${state}: $${actual.cap} cap (${expected.law})`);
    }
  }

  if (issues === 0) {
    console.log('  All doc fee caps verified correctly.');
  } else {
    console.log(`  Found ${issues} issue(s).`);
  }
}

function checkMsrpCoverage() {
  console.log('\n--- MSRP Data Coverage ---');
  const msrpFile = path.join(DATA_DIR, 'vehicle-msrp.json');
  const msrp = JSON.parse(readFileSync(msrpFile, 'utf-8'));

  const vehicles = Object.keys(msrp);
  console.log(`  Total vehicles: ${vehicles.length}`);

  const currentYear = new Date().getFullYear();
  let missing = 0;
  for (const vehicle of vehicles) {
    const years = Object.keys(msrp[vehicle]);
    if (!years.includes(String(currentYear)) && !years.includes(String(currentYear + 1))) {
      console.log(`  [OUTDATED] ${vehicle}: Latest year is ${years[years.length - 1]}`);
      missing++;
    }
  }

  if (missing === 0) {
    console.log('  All vehicles have current year data.');
  }
}

async function main() {
  console.log('BringTheApp Data Update');
  console.log(`Date: ${new Date().toISOString()}`);

  verifyDocFeeCaps();
  checkMsrpCoverage();

  if (process.env.API_NINJAS_KEY) {
    await updateTaxRates();
  } else {
    console.log('\n--- Skipping Tax Rate Update (no API_NINJAS_KEY) ---');
  }

  console.log('\nDone.');
}

main().catch(console.error);
