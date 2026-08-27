const global = globalThis as typeof globalThis & {
  process?: { env: Record<string, string | undefined> };
};

global.process ??= { env: {} };
