export const config = { runtime: 'edge' };

const VOICE_MAP = {
  0: 'XB0fDUnXU5powFXDhCwa', // Charlotte - 할매 느낌 (여성, 나이든 톤)
  1: 'onwK4e9ZLuTAKqWW03F9', // Daniel - 낮고 강한 톤 (악마)
  2: 'pNInz6obpgDQGcFmaJgB', // Adam - 꼰대 아저씨 톤 (도사)
};

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
    const { text, charIndex = 0 } = await req.json();

    if (!text || text.length > 2000) {
      return new Response(JSON.stringify({ error: '텍스트 오류' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const voiceId = VOICE_MAP[charIndex] || VOICE_MAP[0];
    const apiKey = process.env.ELEVENLABS_API_KEY;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
