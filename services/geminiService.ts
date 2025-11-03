
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateWelcomeMessage = async (guestName: string, roomName: string, guestHouseName: string): Promise<string> => {
  if (!API_KEY) {
    return `${guestName}님, ${guestHouseName}에 오신 것을 환영합니다! ${roomName}에서 편안한 시간 보내시길 바랍니다.`;
  }

  const prompt = `${guestHouseName}에 체크인하는 ${guestName}님을 위한 환영 메시지를 작성해줘. 방은 ${roomName}이야. 친절하고 따뜻한 느낌으로, 주변의 가볼 만한 곳 한두 군데를 추천해줘. 메시지는 한국어로 작성하고, 간결하게 만들어줘.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `[AI 메시지 생성 실패] ${guestName}님, ${guestHouseName}에 오신 것을 환영합니다! ${roomName}에서 편안한 시간 보내시길 바랍니다.`;
  }
};

export const getWeatherInfo = async (): Promise<{ seoul: { temp: number; weather: string }; monterrey: { temp: number; weather: string } } | null> => {
    if (!API_KEY) {
        console.warn("API_KEY is not set. Weather feature disabled.");
        return null;
    }

    const prompt = `대한민국 서울과 멕시코 몬테레이의 현재 실시간 날씨와 섭씨 온도를 구글 검색을 통해 알려줘. 응답은 반드시 아래와 같은 JSON 형식이어야 해:
\`\`\`json
{
  "seoul": {
    "weather": "날씨 설명",
    "temp": 25
  },
  "monterrey": {
    "weather": "날씨 설명",
    "temp": 30
  }
}
\`\`\`
날씨 설명은 '맑음', '흐림', '구름 많음', '비', '눈', '안개', '천둥번개' 중 하나로 아주 짧은 한국어 단어로 응답해줘.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        let jsonString = response.text.trim();
        // Handle markdown code block if present
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        } else if (jsonString.startsWith('```')) {
             jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        }

        const weatherData = JSON.parse(jsonString);
        return weatherData;
    } catch (error) {
        console.error("Error fetching weather info:", error);
        return null;
    }
};