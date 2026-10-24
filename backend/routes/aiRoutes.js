const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getModel, generateWithRetry } = require('../utils/gemini');

// The Gemini key stays on the server; the frontend sends prompts through this route

// Only these generation settings may be chosen by the client
const ALLOWED_CONFIG_KEYS = ['temperature', 'maxOutputTokens', 'responseMimeType'];

function isValidPart(part) {
  if (typeof part === 'string') return true;
  return !!part && typeof part === 'object' && part.inlineData &&
    typeof part.inlineData.mimeType === 'string' &&
    typeof part.inlineData.data === 'string';
}

// Generate content from a text prompt or a list of parts (text and inline media)
router.post('/generate', authenticateToken, async (req, res) => {
  const { contents, generationConfig = {} } = req.body || {};

  const valid = typeof contents === 'string'
    ? contents.trim().length > 0
    : Array.isArray(contents) && contents.length > 0 && contents.every(isValidPart);
  if (!valid) {
    return res.status(400).json({ message: 'Invalid contents' });
  }

  const config = {};
  for (const key of ALLOWED_CONFIG_KEYS) {
    if (generationConfig[key] !== undefined) config[key] = generationConfig[key];
  }

  try {
    const result = await generateWithRetry(getModel(config), contents);
    res.json({ text: result.response.text() });
  } catch (error) {
    console.error('Gemini request failed:', error.message);
    res.status(502).json({ message: 'AI request failed' });
  }
});

module.exports = router;
