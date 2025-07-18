// Utility to parse .env file content into key-value pairs
export interface EnvKeyValue {
  key: string;
  value: string;
}

export function parseEnv(content: string): EnvKeyValue[] {
  const lines = content.split(/\r?\n/);
  const result: EnvKeyValue[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) {
      result.push({ key, value });
    }
  }
  return result;
} 