import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AI_SPEED_DELAYS, DEFAULT_AI_SPEED, loadAiSpeed, saveAiSpeed } from "./settings";

// Faux localStorage en mémoire : les tests tournent sans navigateur.
function installFakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));

  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };

  return data;
}

describe("réglages", () => {
  beforeEach(() => {
    installFakeStorage();
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it("renvoie la vitesse par défaut quand rien n'est enregistré", () => {
    expect(loadAiSpeed()).toBe(DEFAULT_AI_SPEED);
  });

  it("relit la vitesse enregistrée", () => {
    saveAiSpeed("fast");

    expect(loadAiSpeed()).toBe("fast");
  });

  it("ignore une valeur inconnue", () => {
    installFakeStorage({ "shadow-hunt-settings-v1": JSON.stringify({ aiSpeed: "turbo" }) });

    expect(loadAiSpeed()).toBe(DEFAULT_AI_SPEED);
  });

  it("ignore un contenu illisible", () => {
    installFakeStorage({ "shadow-hunt-settings-v1": "{pas du json" });

    expect(loadAiSpeed()).toBe(DEFAULT_AI_SPEED);
  });

  it("ne plante pas quand le stockage n'est pas disponible", () => {
    delete (globalThis as { localStorage?: unknown }).localStorage;

    expect(loadAiSpeed()).toBe(DEFAULT_AI_SPEED);
    expect(() => saveAiSpeed("slow")).not.toThrow();
  });
});

describe("délais de l'IA", () => {
  it("vont du plus lent au plus rapide", () => {
    expect(AI_SPEED_DELAYS.slow).toBeGreaterThan(AI_SPEED_DELAYS.normal);
    expect(AI_SPEED_DELAYS.normal).toBeGreaterThan(AI_SPEED_DELAYS.fast);
    expect(AI_SPEED_DELAYS.fast).toBeGreaterThan(0);
  });
});
