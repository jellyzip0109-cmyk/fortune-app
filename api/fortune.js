

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { birth, gender, charIndex } = await req.json();

    const chars = [
      '경상도 사투리를 쓰는 70대 욕쟁이 할매',
      '지옥에서 온 독설 악마',
      '막걸리에 취한 꼰대 도사',
    ];

    const age = new Date().getFullYear() - new Date(birth).getFullYear();
    const today = new Date().toLocaleDateString('ko-KR', {
      month: 'long', day: 'numeric', weekday: 'short'
    });

    const prompt = `당신은 ${chars[charIndex] || chars[0]}입니다. ${today} 기준으로 ${age}세 ${gender}의 오늘 하루 운세를 봐주세요.

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "total": "총운 (욕과 거친 말투로 3~4문장. 할매라면 경상도 사투리 + 욕 섞기)",
  "love": {"stars": 3, "text": "애정운 한두 문장"},
  "money": {"stars": 4, "text": "재물운 한두 문장"},
  "work": {"stars": 2, "text": "직업운 한두 문장"},
  "health": {"stars": 3, "text": "건강운 한두 문장"},
  "luckyColor": "행운의 색",
  "luckyNumber": 7,
  "luckyFood": "행운의 음식",
  "avoid": "오늘 피할 것"
}

모든 텍스트에 캐릭터 특유의 말투와 욕/직설적 표현을 반드시 포함하세요. 순화하지 마세요.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fortune-app-kohl.vercel.app',
        'X-Title': '욕쟁이 운세',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const fortune = JSON.parse(clean);

    return new Response(JSON.stringify(fortune), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
