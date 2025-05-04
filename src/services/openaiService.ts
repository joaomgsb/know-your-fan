import OpenAI from "openai";

/** ------------------------------------------------------------------
 *  Instância do cliente
 *  (lembre‑se de mover a chamada p/ back‑end se for produção!)
 *  -----------------------------------------------------------------*/
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  // SÓ use essa flag se você realmente precisar expor a chave no front
  dangerouslyAllowBrowser: true,
});

/** ------------------------------------------------------------------
 *  Tipos de dados
 *  -----------------------------------------------------------------*/
export interface AIValidationResponse {
  isValid: boolean;
  confidence: number;
  reason?: string;
}

/** ------------------------------------------------------------------
 *  Validação de perfil via IA
 *  -----------------------------------------------------------------*/
export const validateProfileWithAI = async (
  platform: string,
  username: string,
  profileUrl: string,
  // valor‑default evita undefined.join(...)
  userInterests: string[] = []
): Promise<AIValidationResponse> => {
  try {
    /* --------------------------------------------------------------
     * Prepara o prompt em linguagem natural
     * -------------------------------------------------------------*/
    const interestsText = (Array.isArray(userInterests) ? userInterests : []).join(
      ", "
    );

    const prompt = `
Analise o perfil de jogador com as seguintes informações:
- Plataforma: ${platform}
- Username: ${username}
- URL do perfil: ${profileUrl}
- Interesses do usuário: ${interestsText}

Determine:
1. Se o perfil é válido para a plataforma especificada
2. Se o perfil é relevante para os interesses do usuário
3. Qual o nível de confiança na validação (0 a 1)
4. Se houver problemas, explique o motivo

Responda apenas com um objeto JSON no formato:
{
  "isValid": boolean,
  "confidence": number,
  "reason": string
}
    `.trim();

    /* --------------------------------------------------------------
     * Chama a OpenAI
     * -------------------------------------------------------------*/
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em validação de perfis de jogos. Responda apenas com JSON válido.",
        },
        { role: "user", content: prompt },
      ],
    });

    /* --------------------------------------------------------------
     * Faz o parse do JSON com fallback seguro
     * -------------------------------------------------------------*/
    let response: Partial<AIValidationResponse> = {};
    try {
      response = JSON.parse(
        completion.choices?.[0]?.message?.content ?? "{}"
      ) as Partial<AIValidationResponse>;
    } catch (parseErr) {
      console.warn("Resposta da IA não é JSON válido:", parseErr);
    }

    /* --------------------------------------------------------------
     * Normaliza os campos e devolve
     * -------------------------------------------------------------*/
    return {
      isValid: Boolean(response.isValid),
      confidence: Number(response.confidence ?? 0),
      reason: response.reason,
    };
  } catch (error) {
    console.error("Erro ao validar com IA:", error);

    // fallback mínimo para não travar o fluxo do app
    return {
      isValid: true,
      confidence: 0.5,
      reason: "Erro na validação com IA, validação básica aplicada",
    };
  }
};
