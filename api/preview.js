// /api/preview.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await response.text();

    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || null;
    const ogImage = html.match(/property="og:image" content="(.*?)"/)?.[1] || null;

    if (!title && !ogImage) {
      return res.status(200).json({ url }); // Fallback: return URL only
    }

    return res.status(200).json({ title, ogImage, url });
  } catch (error) {
    console.error('🔥 Preview fetch error:', error.message);
    return res.status(500).json({ error: 'Preview fetch failed' });
  }
}
