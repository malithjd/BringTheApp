import { Router } from 'express';
import PDFDocument from 'pdfkit';

const router = Router();

// Print-friendly palette — white background, accent colors preserved for visual identity
const C = {
  bg: '#ffffff',
  surface: '#ffffff',
  surface2: '#f1f5f9',       // very light gray for track bars
  border: '#e2e8f0',          // light gray border
  text: '#0f172a',            // near-black for body text
  text2: '#64748b',           // muted slate for secondary
  accent: '#0284c7',          // darker cyan — readable on white
  green: '#059669',           // darker emerald for print
  amber: '#d97706',           // darker amber for print
  red: '#dc2626',             // darker red for print
  flagBg: '#fafafa',          // near-white flag box bg
};

const money = (n) => n == null || isNaN(n) ? '—' : `$${Math.round(Number(n)).toLocaleString()}`;
const money2 = (n) => n == null || isNaN(n) ? '—' : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const pct = (n) => n == null ? '—' : `${n}%`;
const safe = (s) => s == null ? '' : String(s);

function scoreColor(pts, max) {
  const ratio = max > 0 ? pts / max : 0;
  if (pts <= 0) return C.red;
  if (ratio >= 0.7) return C.green;
  if (ratio >= 0.4) return C.amber;
  return C.red;
}

/**
 * Generate a deal analysis PDF report and stream it as the response.
 */
router.post('/report', async (req, res) => {
  const { result } = req.body;
  if (!result || typeof result !== 'object') {
    return res.status(400).json({ error: 'Missing result object in request body' });
  }

  const v = result.vehicle || {};
  const e = result.entered || {};
  const c = result.calculated || {};
  const score = Number(result.score) || 0;
  const scoreClr = score >= 70 ? C.green : score >= 40 ? C.amber : C.red;

  const filename = `BringTheApp-${safe(v.year)}-${safe(v.make)}-${safe(v.model)}-${score}.pdf`
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    info: {
      Title: `BringTheApp - ${v.year || ''} ${v.make || ''} ${v.model || ''} Deal Analysis`,
      Author: 'BringTheApp',
      Subject: `Score: ${score}/100 - ${result.label || ''}`,
    },
  });

  doc.pipe(res);

  // ---- Page dimensions ----
  const pageW = doc.page.width;
  const contentW = pageW - 80;
  const leftX = 40;
  const rightX = pageW - 40;

  // White page (PDFKit default) — no need to paint background.
  // Keeps print ink usage minimal.

  // ---- Header ----
  doc.fillColor(C.accent).fontSize(18).font('Helvetica-Bold').text('BringTheApp', leftX, 40);
  doc.fillColor(C.text2).fontSize(9).font('Helvetica').text(
    `Report generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    leftX, 62
  );
  // Accent line
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(leftX, 82).lineTo(rightX, 82).stroke();

  doc.moveDown(2);
  let y = 100;

  // ==================================================================
  // SECTION 1: Score + Vehicle
  // ==================================================================
  // Score circle (drawn as stacked arcs)
  const circleX = leftX + 50;
  const circleY = y + 50;
  const radius = 38;

  // Background ring
  doc.save();
  doc.lineWidth(7).strokeColor(C.surface2);
  doc.circle(circleX, circleY, radius).stroke();

  // Progress arc
  const progress = score / 100;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + 2 * Math.PI * progress;
  doc.strokeColor(scoreClr).lineWidth(7);
  const steps = 64;
  let prevX = circleX + radius * Math.cos(startAngle);
  let prevY = circleY + radius * Math.sin(startAngle);
  doc.moveTo(prevX, prevY);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + (endAngle - startAngle) * t;
    const px = circleX + radius * Math.cos(angle);
    const py = circleY + radius * Math.sin(angle);
    doc.lineTo(px, py);
  }
  doc.stroke();
  doc.restore();

  // Score number
  doc.fillColor(scoreClr).fontSize(26).font('Helvetica-Bold')
    .text(String(score), circleX - 30, circleY - 14, { width: 60, align: 'center' });
  doc.fillColor(C.text2).fontSize(7).font('Helvetica')
    .text('out of 100', circleX - 30, circleY + 14, { width: 60, align: 'center' });

  // Vehicle info next to circle
  const infoX = leftX + 120;
  doc.fillColor(C.text).fontSize(18).font('Helvetica-Bold')
    .text(`${safe(v.year)} ${safe(v.make)} ${safe(v.model)} ${safe(v.trim)}`.trim(), infoX, y + 10, { width: contentW - 120 });
  doc.fillColor(scoreClr).fontSize(11).font('Helvetica-Bold')
    .text(safe(result.label), infoX, y + 35);
  doc.fillColor(C.text2).fontSize(9).font('Helvetica')
    .text(
      `${v.condition === 'new' ? 'New' : 'Used'}${v.mileage ? ` · ${Number(v.mileage).toLocaleString()} mi` : ''}${c.state ? ` · ${c.state}` : ''}`,
      infoX, y + 52
    );

  y += 120;

  // ==================================================================
  // SECTION 2: Deal Summary (two columns)
  // ==================================================================
  drawSectionTitle(doc, 'Deal Summary', leftX, y);
  y += 28;

  const colW = (contentW - 20) / 2;
  const leftCol = leftX;
  const rightCol = leftX + colW + 20;
  const sectionStartY = y;

  // LEFT: What You Entered
  doc.fillColor(C.text2).fontSize(8).font('Helvetica-Bold').text('WHAT YOU ENTERED', leftCol, y);
  let leftY = y + 16;
  const entered = [
    ['Vehicle Price', money(e.price)],
    ['Down Payment', money(e.down)],
    ['Trade-In', e.tradeIn ? money(e.tradeIn) : null],
    ['Amount Owed', e.tradeOwed ? money(e.tradeOwed) : null],
    ['APR', e.apr != null ? pct(e.apr) : null],
    ['Term', e.term ? `${e.term} months` : 'Cash deal'],
  ].filter(([, val]) => val != null);

  for (const [k, val] of entered) {
    doc.fillColor(C.text2).fontSize(10).font('Helvetica').text(k, leftCol, leftY);
    doc.fillColor(C.text).fontSize(10).font('Helvetica').text(val, leftCol, leftY, { width: colW, align: 'right' });
    leftY += 16;
  }

  // Add-ons
  if (e.addons?.length > 0) {
    leftY += 4;
    doc.strokeColor(C.border).lineWidth(0.5).moveTo(leftCol, leftY).lineTo(leftCol + colW, leftY).stroke();
    leftY += 8;
    doc.fillColor(C.text2).fontSize(8).font('Helvetica-Bold').text('ADD-ONS', leftCol, leftY);
    leftY += 12;
    for (const a of e.addons) {
      doc.fillColor(C.text2).fontSize(9).font('Helvetica').text(safe(a.name), leftCol + 8, leftY, { width: colW - 80 });
      doc.fillColor(C.text).fontSize(9).font('Helvetica').text(money(a.price), leftCol, leftY, { width: colW, align: 'right' });
      leftY += 14;
    }
  }

  // RIGHT: Calculated
  doc.fillColor(C.text2).fontSize(8).font('Helvetica-Bold').text('CALCULATED', rightCol, y);
  let rightY = y + 16;
  const calcRows = [
    [`Sales Tax${c.taxRate ? ` (${c.taxRate}%)` : ''}`, money2(c.taxAmount), c.taxLaw?.statute],
    ['Doc Fee', money(c.docFee), c.docFeeLaw],
    ['Registration', money(c.regFee)],
    ['Title Fee', money(c.titleFee)],
  ].filter(([, val]) => val !== '—');

  for (const [k, val, legal] of calcRows) {
    doc.fillColor(C.text2).fontSize(10).font('Helvetica').text(k, rightCol, rightY);
    doc.fillColor(C.text).fontSize(10).font('Helvetica').text(val, rightCol, rightY, { width: colW, align: 'right' });
    rightY += 14;
    if (legal) {
      doc.fillColor(C.text2).fontSize(7).font('Helvetica-Oblique').text(legal, rightCol, rightY, { width: colW });
      rightY += 10;
    }
    rightY += 2;
  }

  // Divider
  rightY += 4;
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(rightCol, rightY).lineTo(rightCol + colW, rightY).stroke();
  rightY += 8;

  const totals = [
    ['Total Cost', money(c.totalCost), C.text, true],
    ['Loan Amount', money(c.loanAmount), C.text, true],
  ];
  for (const [k, val, color, bold] of totals) {
    doc.fillColor(C.text).fontSize(10).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(k, rightCol, rightY);
    doc.fillColor(color).fontSize(10).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(val, rightCol, rightY, { width: colW, align: 'right' });
    rightY += 16;
  }

  rightY += 4;
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(rightCol, rightY).lineTo(rightCol + colW, rightY).stroke();
  rightY += 8;

  if (c.monthlyPayment) {
    doc.fillColor(C.text).fontSize(10).font('Helvetica-Bold').text('Monthly Payment', rightCol, rightY);
    doc.fillColor(C.accent).fontSize(13).font('Helvetica-Bold').text(money2(c.monthlyPayment), rightCol, rightY - 2, { width: colW, align: 'right' });
    rightY += 18;
  }
  const restRows = [
    ['Total Interest', money(c.totalInterest)],
    ['Total You\'ll Pay', money(c.totalPaid), C.text, true],
  ];
  for (const [k, val, color, bold] of restRows) {
    doc.fillColor(C.text2).fontSize(10).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(k, rightCol, rightY);
    doc.fillColor(color || C.text).fontSize(10).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(val, rightCol, rightY, { width: colW, align: 'right' });
    rightY += 16;
  }

  y = Math.max(leftY, rightY) + 20;
  ensureSpace(doc, y, 140);
  y = doc.y;

  // ==================================================================
  // SECTION 3: Market Check
  // ==================================================================
  const market = result.market || {};
  const calc = market.calculated;
  const listings = market.listings;

  if (calc?.estimated != null || listings?.avgPrice != null) {
    drawSectionTitle(doc, 'Market Check', leftX, y);
    y += 28;

    if (calc?.baseMsrp) {
      doc.fillColor(C.text2).fontSize(10).font('Helvetica').text('Original MSRP', leftX, y);
      doc.fillColor(C.text).fontSize(10).font('Helvetica-Bold').text(money(calc.baseMsrp), leftX, y, { width: contentW, align: 'right' });
      y += 16;
    }
    if (calc?.age != null) {
      doc.fillColor(C.text2).fontSize(10).font('Helvetica').text('Age / Depreciation', leftX, y);
      doc.fillColor(C.text).fontSize(10).font('Helvetica').text(
        `${calc.age}yr — ${Math.round((1 - calc.depFactor) * 100)}% depreciated`,
        leftX, y, { width: contentW, align: 'right' }
      );
      y += 20;
    }

    if (calc?.estimated != null) {
      y = drawMarketBar(doc, leftX, y, contentW, 'Calculated Fair Value', 'MSRP + depreciation model', calc.estimated, calc.low, calc.high, e.price);
    }
    if (listings?.avgPrice != null) {
      y = drawMarketBar(doc, leftX, y, contentW, 'Market Average', `From ${listings.listingCount} similar listings`, listings.avgPrice, listings.priceRange?.low || listings.avgPrice * 0.85, listings.priceRange?.high || listings.avgPrice * 1.15, e.price);
    }
    y += 10;
  }

  ensureSpace(doc, y, 100);
  y = doc.y;

  // ==================================================================
  // SECTION 4: Deal Assessment (Flags)
  // ==================================================================
  const redFlags = result.flags?.redFlags || [];
  const greenFlags = result.flags?.greenFlags || [];

  if (redFlags.length > 0 || greenFlags.length > 0) {
    drawSectionTitle(doc, 'Deal Assessment', leftX, y);
    y += 28;

    if (redFlags.length > 0) {
      doc.fillColor(C.red).fontSize(9).font('Helvetica-Bold').text(`ISSUES FOUND (${redFlags.length})`, leftX, y);
      y += 14;
      for (const f of redFlags) {
        y = drawFlag(doc, leftX, y, contentW, f, C.red);
      }
      y += 6;
    }

    if (greenFlags.length > 0) {
      ensureSpace(doc, y, 80);
      y = doc.y;
      doc.fillColor(C.green).fontSize(9).font('Helvetica-Bold').text(`WHAT'S GOOD (${greenFlags.length})`, leftX, y);
      y += 14;
      for (const f of greenFlags) {
        y = drawFlag(doc, leftX, y, contentW, f, C.green);
      }
      y += 6;
    }
    y += 10;
  }

  ensureSpace(doc, y, 80);
  y = doc.y;

  // ==================================================================
  // SECTION 5: Negotiation Scripts
  // ==================================================================
  const scripts = result.scripts || [];
  if (scripts.length > 0) {
    drawSectionTitle(doc, 'Negotiation Scripts', leftX, y);
    y += 28;

    for (const s of scripts) {
      const textHeight = doc.heightOfString(s.script || '', { width: contentW - 20, lineGap: 2 });
      const boxHeight = textHeight + 36;
      ensureSpace(doc, y, boxHeight + 10);
      y = doc.y;

      doc.save();
      doc.rect(leftX, y, contentW, boxHeight).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();

      doc.fillColor(C.amber).fontSize(8).font('Helvetica-Bold').text((s.issue || '').toUpperCase(), leftX + 10, y + 10);
      doc.fillColor(C.text).fontSize(9).font('Helvetica-Oblique').text(s.script || '', leftX + 10, y + 24, { width: contentW - 20, lineGap: 2 });

      y += boxHeight + 8;
    }
    y += 10;
  }

  ensureSpace(doc, y, 180);
  y = doc.y;

  // ==================================================================
  // SECTION 6: Score Breakdown
  // ==================================================================
  const factors = result.factors || [];
  if (factors.length > 0) {
    drawSectionTitle(doc, 'Score Breakdown', leftX, y);
    y += 28;

    for (const f of factors) {
      ensureSpace(doc, y, 24);
      y = doc.y;
      const displayPts = Math.max(0, f.points);
      const color = scoreColor(displayPts, f.max);
      const ratio = f.max > 0 ? displayPts / f.max : 0;

      doc.fillColor(C.text).fontSize(10).font('Helvetica').text(f.name, leftX, y);
      doc.fillColor(color).fontSize(10).font('Helvetica-Bold').text(`${displayPts}/${f.max}`, leftX, y, { width: contentW, align: 'right' });
      y += 14;
      // Bar
      doc.save();
      doc.roundedRect(leftX, y, contentW, 3, 1.5).fill(C.surface2);
      doc.roundedRect(leftX, y, contentW * ratio, 3, 1.5).fill(color);
      doc.restore();
      y += 14;
    }
  }

  // ---- Footer ----
  const footerY = doc.page.height - 28;
  doc.fillColor(C.text2).fontSize(7).font('Helvetica').text(
    'Generated by BringTheApp · bringtheapp.onrender.com · This report is for informational purposes only.',
    leftX, footerY, { width: contentW, align: 'center' }
  );

  doc.end();
});

// ---- Helpers ----

function drawSectionTitle(doc, title, x, y) {
  doc.fillColor(C.text).fontSize(13).font('Helvetica-Bold').text(title, x, y);
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(x, y + 20).lineTo(doc.page.width - 40, y + 20).stroke();
}

function drawFlag(doc, x, y, width, flagText, color) {
  const isString = typeof flagText === 'string';
  const title = isString ? '' : (flagText.title || '');
  const detail = isString ? flagText : (flagText.detail || '');
  const action = isString ? '' : (flagText.action || '');

  const fullText = [title, detail, action].filter(Boolean).join('\n');
  const textHeight = doc.heightOfString(fullText, { width: width - 36, lineGap: 1 });
  const boxH = textHeight + 16;

  // Light tinted background + accent-colored border
  doc.save();
  doc.rect(x, y, width, boxH).lineWidth(1).strokeColor(color).stroke();
  doc.restore();

  // Checkmark / X icon
  doc.fillColor(color).fontSize(12).font('Helvetica-Bold').text(color === C.red ? '×' : '✓', x + 8, y + 6);

  let textY = y + 8;
  if (title) {
    doc.fillColor(color).fontSize(9).font('Helvetica-Bold').text(title, x + 26, textY, { width: width - 36 });
    textY += doc.heightOfString(title, { width: width - 36 }) + 2;
  }
  if (detail) {
    doc.fillColor(C.text).fontSize(8).font('Helvetica').text(detail, x + 26, textY, { width: width - 36, lineGap: 1 });
    textY += doc.heightOfString(detail, { width: width - 36, lineGap: 1 }) + 2;
  }
  if (action) {
    doc.fillColor(C.text2).fontSize(8).font('Helvetica-Oblique').text(action, x + 26, textY, { width: width - 36 });
  }

  return y + boxH + 6;
}

function drawMarketBar(doc, x, y, width, label, subtitle, reference, low, high, userPrice) {
  // Color based on user price vs reference
  const ratio = userPrice / reference;
  let color = C.green;
  let statusText = 'Within range';
  const diff = userPrice - reference;
  if (ratio > 1.15) { color = C.red; statusText = `${money(diff)} above`; }
  else if (ratio > 1.05) { color = C.amber; statusText = `${money(diff)} above`; }
  else if (ratio < 0.95) { color = C.green; statusText = `${money(Math.abs(diff))} below`; }

  // Label + reference
  doc.fillColor(C.text).fontSize(10).font('Helvetica-Bold').text(label, x, y);
  doc.fillColor(color).fontSize(10).font('Helvetica-Bold').text(money(reference), x, y, { width, align: 'right' });
  y += 13;
  if (subtitle) {
    doc.fillColor(C.text2).fontSize(7).font('Helvetica').text(subtitle, x, y);
    y += 10;
  }

  // Bar
  doc.save();
  doc.roundedRect(x, y, width, 4, 2).fill(C.surface2);

  // Position indicator (user's price relative to bar range)
  const range = high - low;
  const position = range > 0 ? Math.max(0, Math.min(1, (userPrice - low) / range)) : 0.5;
  const cx = x + width * position;
  doc.circle(cx, y + 2, 4).fill(color);
  doc.restore();
  y += 10;

  // Range labels
  doc.fillColor(C.text2).fontSize(7).font('Helvetica').text(money(low), x, y);
  doc.fillColor(C.text2).fontSize(7).font('Helvetica').text(money(high), x, y, { width, align: 'right' });
  y += 10;

  // Status
  doc.fillColor(color).fontSize(8).font('Helvetica-Bold').text(`Your price: ${money(userPrice)} — ${statusText}`, x, y);
  y += 16;

  return y;
}

/**
 * Ensure there's enough space for upcoming content, adding a new page if not.
 */
function ensureSpace(doc, y, neededHeight) {
  const pageBottom = doc.page.height - 60;
  if (y + neededHeight > pageBottom) {
    doc.addPage();
    doc.y = 40;
  } else {
    doc.y = y;
  }
}

export default router;
