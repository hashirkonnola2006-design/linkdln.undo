import app from '../server/index.js';

export default async function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('API execution error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
}
