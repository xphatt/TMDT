export async function GET() {
  const address = (process.env.STORE_ADDRESS ?? "").trim().slice(0, 240);
  const configured = address.length >= 8;
  return Response.json({
    store: {
      configured,
      address: configured ? address : null,
      mapsUrl: configured ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null,
    },
  }, { headers: { "cache-control": "public, max-age=300" } });
}
