/**
 * Staggered publishing slots for approved blog drafts.
 *
 * Slots are weekly: Mondays at 14:00 UTC (10 AM ET) — the same rhythm as the
 * auto-blog generator, so the site publishes on a steady cadence Google can
 * learn instead of in bursts. Each approved draft takes the first Monday slot
 * that no other post is already scheduled for.
 */

const SLOT_UTC_HOUR = 14
const MONDAY = 1

/** The first Monday-14:00-UTC slot strictly after `after`. */
export function nextMondaySlot(after: Date): Date {
  const slot = new Date(after)
  slot.setUTCHours(SLOT_UTC_HOUR, 0, 0, 0)
  // If we're past today's slot time, start from tomorrow.
  if (slot <= after) {
    slot.setUTCDate(slot.getUTCDate() + 1)
  }
  // Advance to Monday.
  while (slot.getUTCDay() !== MONDAY) {
    slot.setUTCDate(slot.getUTCDate() + 1)
  }
  return slot
}

/**
 * Pick the next unclaimed weekly slot given the posts already scheduled.
 * `scheduledDates` are existing future scheduledPublishAt values.
 */
export function nextOpenSlot(scheduledDates: Date[], now: Date = new Date()): Date {
  const taken = new Set(
    scheduledDates
      .filter((d) => d.getTime() > now.getTime())
      .map((d) => d.getTime())
  )

  let candidate = nextMondaySlot(now)
  // Walk forward week by week until we find a free slot (bounded for safety).
  for (let i = 0; i < 52; i++) {
    if (!taken.has(candidate.getTime())) return candidate
    candidate = new Date(candidate.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
  return candidate
}
