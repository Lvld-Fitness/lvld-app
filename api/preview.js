import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US',
      },
    });

    const html = await response.text();

    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const ogImage = html.match(/property="og:image" content="(.*?)"/)?.[1] || '';

    res.status(200).json({ title, ogImage, url });
  } catch (error) {
    console.error('Preview fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch link preview' });
  }
}
