export type AddressSuggestion = {
  label: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
};

type GeoapifyResult = {
  formatted?: unknown;
  address_line1?: unknown;
  address_line2?: unknown;
  state?: unknown;
  city?: unknown;
  district?: unknown;
  county?: unknown;
  lat?: unknown;
  lon?: unknown;
};

type GeoapifyPayload = { results?: unknown };

export class AddressServiceError extends Error {
  constructor(
    public readonly code: "geoapify_rejected_key" | "geoapify_unavailable" | "geoapify_invalid_response",
    message: string,
  ) {
    super(message);
    this.name = "AddressServiceError";
  }
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asCoordinate(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function fetchAddressSuggestions(
  query: string,
  apiKey: string,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<AddressSuggestion[]> {
  const normalizedQuery = query.trim().slice(0, 160);
  if (normalizedQuery.length < 3) return [];

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", normalizedQuery);
  url.searchParams.set("filter", "countrycode:vn");
  url.searchParams.set("limit", "5");
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "vi");
  url.searchParams.set("apiKey", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 6000);

  let response: Response;
  try {
    response = await (options.fetchImpl ?? fetch)(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
  } catch {
    throw new AddressServiceError("geoapify_unavailable", "Không thể kết nối dịch vụ gợi ý địa chỉ.");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AddressServiceError("geoapify_rejected_key", "Geoapify từ chối cấu hình API hiện tại.");
  }
  if (!response.ok) {
    throw new AddressServiceError("geoapify_unavailable", "Dịch vụ gợi ý địa chỉ đang tạm thời không khả dụng.");
  }

  let payload: GeoapifyPayload;
  try {
    payload = (await response.json()) as GeoapifyPayload;
  } catch {
    throw new AddressServiceError("geoapify_invalid_response", "Geoapify trả về dữ liệu không hợp lệ.");
  }

  if (!Array.isArray(payload.results)) {
    throw new AddressServiceError("geoapify_invalid_response", "Geoapify trả về dữ liệu không hợp lệ.");
  }

  const seen = new Set<string>();
  const suggestions: AddressSuggestion[] = [];
  for (const item of payload.results as GeoapifyResult[]) {
    const latitude = asCoordinate(item.lat);
    const longitude = asCoordinate(item.lon);
    const label = cleanText(item.formatted) || [cleanText(item.address_line1), cleanText(item.address_line2)].filter(Boolean).join(", ");
    if (!label || latitude === null || longitude === null || seen.has(label)) continue;

    seen.add(label);
    suggestions.push({
      label,
      province: cleanText(item.state) || cleanText(item.city),
      district: cleanText(item.district) || cleanText(item.county),
      latitude,
      longitude,
    });
    if (suggestions.length === 5) break;
  }

  return suggestions;
}
