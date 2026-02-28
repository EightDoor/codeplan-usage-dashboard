export default async function handler(req, res) {
  const path = req.params.path || '';
  const queryString = req.url.split('?')[1] || '';
  
  const targetUrl = `https://open.bigmodel.cn/api/monitor/${path}${queryString ? '?' + queryString : ''}`;
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
