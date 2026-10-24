// Vercel serverless entry: serves the Express backend (CommonJS) under /api
import app from '../backend/server.js';

export default function handler(req, res) {
  // Frontend calls /api/<backend path>; the backend routes don't include that prefix
  req.url = req.url.replace(/^\/api(?=\/|\?|$)/, '') || '/';
  return app(req, res);
}
