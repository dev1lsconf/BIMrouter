import test from "node:test";
import assert from "node:assert/strict";
import { validatePrompt } from "../src/lib/prompt-validation.ts";

test("recorta espacios exteriores y acepta un prompt válido", () => {
  assert.deepEqual(validatePrompt("  consulta BIM  "), { ok: true, prompt: "consulta BIM" });
});

test("rechaza prompts vacíos y tipos que no sean texto", () => {
  assert.deepEqual(validatePrompt("  "), { ok: false, error: "Escribe una solicitud de 1 a 2000 caracteres." });
  assert.deepEqual(validatePrompt(null), { ok: false, error: "Escribe una solicitud de 1 a 2000 caracteres." });
});

test("limita los prompts a 2000 caracteres inclusive", () => {
  assert.equal(validatePrompt("a".repeat(2000)).ok, true);
  assert.equal(validatePrompt("a".repeat(2001)).ok, false);
});
