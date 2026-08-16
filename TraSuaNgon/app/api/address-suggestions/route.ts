import { AddressServiceError, fetchAddressSuggestions } from "../../server/address-suggestions";

const noStoreHeaders = { "cache-control": "no-store" };

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 3) {
    return Response.json(
      { error: { code: "invalid_query", message: "Nhập ít nhất 3 ký tự để tìm địa chỉ." } },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: { code: "address_service_unconfigured", message: "Gợi ý địa chỉ chưa được cấu hình. Bạn vẫn có thể nhập địa chỉ thủ công." } },
      { status: 503, headers: noStoreHeaders },
    );
  }

  try {
    const suggestions = await fetchAddressSuggestions(query, apiKey);
    return Response.json({ suggestions }, { headers: noStoreHeaders });
  } catch (error) {
    const serviceError = error instanceof AddressServiceError ? error : null;
    const code = serviceError?.code === "geoapify_rejected_key" ? "address_service_misconfigured" : "address_service_unavailable";
    const message = serviceError?.code === "geoapify_rejected_key"
      ? "Cấu hình gợi ý địa chỉ chưa hợp lệ. Bạn vẫn có thể nhập địa chỉ thủ công."
      : "Không thể tải gợi ý lúc này. Bạn vẫn có thể nhập địa chỉ thủ công.";
    return Response.json({ error: { code, message } }, { status: 502, headers: noStoreHeaders });
  }
}
