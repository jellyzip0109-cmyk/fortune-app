module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { birth, gender, charIndex } = req.body;

    const chars = [
      '경상도 사투리를 쓰는 70대 욕쟁이 할매',
      '지옥에서 온 독설 악마',
      '막걸리에 취한 꼰대 도사',
    ];

    const age = new Date().getFullYear() - new Date(birth).getFullYear();
    const today = new Date().toLocaleDateString('ko-KR', {
      month: 'long', day: 'numeric', weekda
