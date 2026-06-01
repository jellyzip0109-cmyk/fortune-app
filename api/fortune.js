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
    const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    const prompt = '당신은 ' + (chars[charIndex] || chars[0]) + '입니다. ' + today + ' 기준으로 ' + age + '세 ' + gender + '의 오늘 하루 운세를 봐주세요.\n\n반드시 다음 JSON 형식으로만 응답하세요:\n{"total":"총운","love":{"stars":3,"text":"애정운"},"money":{"stars":4,"text":"재물운"},"work":{"stars":2,"text":"직업운"},"health":{"stars":3,"text":"건강운"},"luckyColor":"색","luckyNumber":7,"luckyFood":"음식","avoid":"피할것"}\n\n캐릭터 특유의 욕과 직설적 말투를 반드시 포함하세요.';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fortune-app-kohl.vercel.app',
        'X-Title': '욕쟁이 운세',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const fortune = JSON.parse(clean);
    return res.status(200).json(fortune);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
