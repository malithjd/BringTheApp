import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import taxRoutes from './routes/tax.js';
import feesRoutes from './routes/fees.js';
import vehicleRoutes from './routes/vehicle.js';
import analyzeRoutes from './routes/analyze.js';
import ocrRoutes from './routes/ocr.js';
import marketRoutes from './routes/auto-dev.js';
import pdfRoutes from './routes/pdf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from server/ directory (for local dev)
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// API routes
app.use('/api/tax', taxRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/pdf', pdfRoutes);

// Health check (used by UptimeRobot to prevent Render free tier sleep)
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// SPA fallback in production (middleware, Express 5 compatible)
if (process.env.NODE_ENV === 'production') {
  app.use((_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
});
