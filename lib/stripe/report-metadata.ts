/**
 * Report data <-> Stripe metadata.
 *
 * A one-time report purchase needs the buyer's calculation inputs to survive the
 * redirect to Stripe and back. We stash them in the Checkout Session metadata
 * (Stripe is the record of the order, so no DB row is required). Each metadata
 * value is capped at 500 chars, so the JSON is chunked across numbered keys and
 * reassembled after payment is verified.
 */

const CHUNK_SIZE = 480
const PRODUCT_TAG = "report"

export function packReportData(data: unknown): Record<string, string> {
  const json = JSON.stringify(data)
  const meta: Record<string, string> = { product: PRODUCT_TAG }

  let count = 0
  for (let pos = 0; pos < json.length; pos += CHUNK_SIZE) {
    meta[`rd${count}`] = json.slice(pos, pos + CHUNK_SIZE)
    count++
  }
  meta.rdn = String(count)
  return meta
}

export function isReportSession(metadata: Record<string, string> | null | undefined): boolean {
  return !!metadata && metadata.product === PRODUCT_TAG
}

export function unpackReportData<T = any>(
  metadata: Record<string, string> | null | undefined
): T | null {
  if (!isReportSession(metadata)) return null
  const count = parseInt(metadata!.rdn || "0", 10)
  if (!count) return null

  let json = ""
  for (let i = 0; i < count; i++) {
    json += metadata![`rd${i}`] ?? ""
  }
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}
