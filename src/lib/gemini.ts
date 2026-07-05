const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface GiftPick {
  productId: string;
  reason: string;
}

export type GeminiRecommendationResult =
  | { success: true; picks: GiftPick[] }
  | { success: false; error: string };

const UNAVAILABLE_ERROR =
  "The Gift Finder is temporarily unavailable. Please try again shortly.";

export async function getGiftRecommendations(
  description: string,
  catalogText: string
): Promise<GeminiRecommendationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Gift Finder isn't available yet. Please check back soon.",
    };
  }

  const prompt = `You are a gift recommendation assistant for Nimki Gift Shop, a Nepali handmade gift store.

A customer described what they're looking for:
"${description}"

Below is the current in-stock product catalog. Only recommend products from this list by their exact id — never invent a product or productId that isn't listed here.

${catalogText}

Pick up to 6 products that best match the customer's description. If nothing in the catalog is a reasonable match, return an empty "picks" array rather than forcing irrelevant suggestions. For each pick, write a short one-sentence reason (under 20 words) explaining why it fits what the customer asked for.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      picks: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            productId: { type: "STRING" },
            reason: { type: "STRING" },
          },
          required: ["productId", "reason"],
        },
      },
    },
    required: ["picks"],
  };

  try {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.4,
        },
      }),
    });

    if (!res.ok) {
      console.error("Gemini API error:", res.status, await res.text());
      return { success: false, error: UNAVAILABLE_ERROR };
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return { success: false, error: UNAVAILABLE_ERROR };
    }

    const parsed = JSON.parse(text);
    const picks: GiftPick[] = Array.isArray(parsed?.picks) ? parsed.picks : [];

    return { success: true, picks };
  } catch (err) {
    console.error("Gemini request failed:", err);
    return { success: false, error: UNAVAILABLE_ERROR };
  }
}