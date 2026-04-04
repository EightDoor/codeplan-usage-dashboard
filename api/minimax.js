export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Extract the path after /api/minimax/
  const minimaxIndex = pathParts.indexOf('minimax');
  const remainingPath = pathParts.slice(minimaxIndex + 1).join('/');

  const queryString = url.search || '';
  const targetUrl = `https://api.minimaxi.com/v1/api/openplatform/${remainingPath}${queryString ? queryString : ''}`;

  console.log('Proxying:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
}