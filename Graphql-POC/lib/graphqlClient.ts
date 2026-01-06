export async function gqlFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { apiKey?: string }
): Promise<TData> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (options?.apiKey) headers["x-api-key"] = options.apiKey;

  const res = await fetch("/api/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await res.json()) as {
    data?: TData;
    errors?: Array<{ message: string }>;
  };

  if (!res.ok || payload.errors?.length) {
    const msg = payload.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (!payload.data) throw new Error("No data returned from GraphQL.");
  return payload.data;
}
