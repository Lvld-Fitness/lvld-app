export default async function handler(req, res) {
    const { prompt } = req.body;
  
    try {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 60,
        }),
      });
  
      const data = await openaiRes.json();
      const fact = data.choices?.[0]?.message?.content || '';
  
      res.status(200).json({ fact });
    } catch (err) {
      console.error('Fun fact fetch failed:', err);
      res.status(500).json({ fact: 'No fun fact this time! Try again later.' });
    }
  }
  