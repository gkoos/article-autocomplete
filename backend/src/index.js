// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RadixTree } from './radix.js';
import { loadInitialCounts, incrementPhrase, subscribeUpdates } from './redis-sync.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Initialize the radix tree
const tree = new RadixTree();

// Load existing counts from Redis
await loadInitialCounts(tree);

// Subscribe to Redis updates from other servers
subscribeUpdates(tree);

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// GET /autocomplete?q=prefix
app.get('/autocomplete', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  
  // Return top 5 suggestions
  const suggestions = tree.search(q, 5);
  res.json(suggestions);
});

// POST /autocomplete
app.post('/autocomplete', async (req, res) => {
  const { phrase } = req.body;
  if (!phrase) return res.status(400).json({ error: 'Missing phrase' });

  try {
    const count = await incrementPhrase(tree, phrase);
    res.json({ phrase, count });
  } catch (err) {
    console.error('Error updating phrase:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Autocomplete backend running on http://localhost:${PORT}`);
});
