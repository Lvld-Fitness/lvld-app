// /api/preview.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    const html = await response.text();

    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const ogImageMatch = html.match(/property="og:image" content="(.*?)"/);

    const title = titleMatch ? titleMatch[1] : null;
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;

    res.status(200).json({
      title: title || 'Link preview',
      ogImage,
      url,
    });
  } catch (err) {
    console.error('🧨 Serverless preview error:', err.message);
    res.status(500).json({ error: 'Internal preview error' });
  }
}
