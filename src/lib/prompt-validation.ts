const INVALID_PROMPT = "Escribe una solicitud de 1 a 2000 caracteres.";

type PromptValidation =
  | { ok: true; prompt: string }
  | { ok: false; error: string };

export function validatePrompt(value: unknown): PromptValidation {
  if (typeof value !== "string" || !value.trim() || value.length > 2000) {
    return { ok: false, error: INVALID_PROMPT };
  }

  return { ok: true, prompt: value.trim() };
}
