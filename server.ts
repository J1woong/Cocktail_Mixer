import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint for AI mixologist substitute advice
app.post('/api/gemini/substitute-advice', async (req, res) => {
  try {
    const { targetIngredient, cocktailContext, availableIngredients } = req.body;

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'GEMINI_API_KEY가 없어 사전 빌트인 데이터베이스로 제공됩니다.',
      });
    }

    const prompt = `당신은 최고급 호텔 및 스피크이지 바의 마스터 믹솔로지스트입니다.
칵테일 조제 시 특정 재료가 없거나 홈바에 있는 재료로 대체하려는 사용자를 위해 정밀하고 실용적인 대체 조언을 한국어로 제공해주세요.

- 대체하려는 재료: ${targetIngredient}
${cocktailContext ? `- 만들고자 하는 칵테일: ${cocktailContext}` : ''}
${availableIngredients ? `- 현재 보유 중인 재료/상황: ${availableIngredients}` : ''}

반드시 유효한 JSON 형식으로만 응답하세요:
{
  "bestSubstitutes": [
    {
      "name": "대체 재료명 (한글/영문)",
      "similarityScore": 90,
      "ratioAdjustment": "용량 조절 안내 (예: 1:1 비율 또는 당도 고려해 5ml 감량)",
      "flavorImpact": "완성작에 미치는 향미 변화 설명",
      "bartenderTip": "바텐더의 실전 조주 팁"
    }
  ],
  "creativeAlternative": "일반 가정이나 마트/편의점에서 쉽게 찾을 수 있는 친숙한 대체재 아이디어",
  "overallAdvice": "마스터 바텐더의 완성도 높이는 조언"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating substitution advice:', error);
    res.status(500).json({ error: error.message || '대체 재료 분석 실패' });
  }
});

// API endpoint for AI custom cocktail suggestion using user's cabinet
app.post('/api/gemini/custom-recipe', async (req, res) => {
  try {
    const { ingredients, mood, preferSweet, preferSour, preferStrong } = req.body;

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'GEMINI_API_KEY 미설정',
      });
    }

    const prompt = `당신은 세계적인 믹솔로지스트입니다.
사용자가 현재 보유하고 있는 재료들을 바탕으로 만들 수 있는 맞춤형 창작 또는 정통 트위스트 칵테일 레시피 1개를 추천해주세요.

보유 재료: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}
선호 취향:
- 분위기/무드: ${mood || '릴랙스'}
- 단맛 선호도: ${preferSweet ?? 5}/10
- 산미(상큼함) 선호도: ${preferSour ?? 5}/10
- 알코올 도수 체감: ${preferStrong ?? 5}/10

반드시 유효한 JSON 형식으로 응답하세요:
{
  "nameKo": "칵테일 한글 이름",
  "nameEn": "Cocktail English Name",
  "concept": "이 칵테일의 테마와 풍미 요약 (1~2문장)",
  "abvEstimate": 18,
  "glassType": "글라스 종류 (예: 온더락 글라스, 쿠페 글라스, 하이볼 등)",
  "iceType": "얼음 종류 (예: 큐브 얼음, 크러시드 얼음 등)",
  "ingredients": [
    { "name": "재료명", "amount": "45ml (1.5 oz)", "isCore": true, "notes": "풍미의 뼈대" }
  ],
  "substitutesUsed": [
    { "original": "원래 클래식에 들어가는 재료", "substitutedWith": "대체된 보유 재료", "reason": "대체 이유와 밸런스 조정법" }
  ],
  "steps": [
    "단계별 상세 조주 가이드 1",
    "단계별 상세 조주 가이드 2"
  ],
  "garnish": "추천 가니시",
  "bartenderComment": "완성도를 극대화하는 프로 바텐더의 킥"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating custom cocktail:', error);
    res.status(500).json({ error: error.message || '칵테일 추천 생성 실패' });
  }
});

// Setup Vite or Static File serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cocktail Guide Server running at http://localhost:${PORT}`);
  });
}

startServer();
