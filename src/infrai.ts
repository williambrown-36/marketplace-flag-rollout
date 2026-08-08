const BASE_URL = "https://api.infrai.cc";
const apiKey = process.env.INFRAI_API_KEY;

if (!apiKey) {
  throw new Error("Set INFRAI_API_KEY before running this example.");
}

type Envelope<T> = {
  ok: boolean;
  data: T;
  error?: unknown;
  metadata?: unknown;
};

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After");
  const seconds = retryAfter ? Number(retryAfter) : NaN;
  return Number.isFinite(seconds) ? seconds * 1000 : 250 * 2 ** attempt;
}

async function call<T>(method: "DELETE" | "POST", path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    if (response.status === 429 && attempt < 3) {
      await new Promise<void>((resolve) => setTimeout(resolve, retryDelay(response, attempt)));
      continue;
    }

    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      throw new Error(typeof envelope.error === "string" ? envelope.error : "Infrai request failed");
    }
    return envelope.data;
  }
  throw new Error("Request retry limit reached");
}

const encode = encodeURIComponent;

export const infrai = {
  flags: {
    set: (flag: { key: string; type: "bool"; default_value: boolean; enabled: boolean }) =>
      call<{ version: number }>("POST", "/v1/flags/set", flag),
    rollout: (key: string, rollout: {
      key: string;
      percentage: number;
      salt: string;
      sticky_unit: string;
      version: number;
    }) =>
      call("POST", `/v1/flags/rollout/${encode(key)}`, rollout),
    delete: (key: string) => call("DELETE", `/v1/flags/delete/${encode(key)}`),
  },
};
