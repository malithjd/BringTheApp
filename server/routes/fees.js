import { Router } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const stateFees = JSON.parse(readFileSync(path.join(__dirname, '../data/state-fees.json'), 'utf-8'));

// GET /api/fees/:state
router.get('/:state', (req, res) => {
  const state = req.params.state.toUpperCase();
  const data = stateFees[state];

  if (!data) {
    return res.status(404).json({ error: `No fee data for state: ${state}` });
  }

  res.json({ state, ...data });
});

export default router;
