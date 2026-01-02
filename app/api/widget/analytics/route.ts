import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

interface WidgetEvent {
  event_type: string
  partner_id?: string
  retirement_group?: string
  theme?: string
  referrer?: string
  user_agent?: string
  timestamp: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      // Silently accept events but don't store them if Supabase not configured
      console.warn("Widget analytics: Supabase not configured, skipping event storage")
      return NextResponse.json({ success: true, stored: false })
    }

    const { events } = await request.json() as { events: WidgetEvent[] }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "No events provided" }, { status: 400 })
    }

    // Limit batch size
    const limitedEvents = events.slice(0, 50)

    // Initialize Supabase client with service role for writes
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Transform events for database insertion
    const dbEvents = limitedEvents.map((event) => ({
      event_type: event.event_type,
      partner_id: event.partner_id || null,
      retirement_group: event.retirement_group || null,
      theme: event.theme || null,
      referrer: event.referrer ? event.referrer.substring(0, 500) : null,
      user_agent: event.user_agent ? event.user_agent.substring(0, 500) : null,
      event_timestamp: event.timestamp,
      metadata: event.metadata || {},
      ip_hash: null, // Could add IP hashing for geo analytics
    }))

    // Insert events into Supabase
    const { error } = await supabase
      .from("widget_analytics")
      .insert(dbEvents)

    if (error) {
      console.error("Widget analytics insert error:", error)
      // Don't fail the request - analytics should not block user experience
      return NextResponse.json({ success: true, warning: "Partial failure" })
    }

    // Update partner daily aggregates if partner_id exists
    const partnerEvents = limitedEvents.filter((e) => e.partner_id)
    if (partnerEvents.length > 0) {
      await updatePartnerAggregates(supabase, partnerEvents)
    }

    return NextResponse.json({ success: true, count: limitedEvents.length })
  } catch (error) {
    console.error("Widget analytics error:", error)
    return NextResponse.json({ success: true }) // Silent fail for analytics
  }
}

async function updatePartnerAggregates(
  supabase: any,
  events: WidgetEvent[]
) {
  const today = new Date().toISOString().split("T")[0]

  // Group events by partner
  const partnerGroups = events.reduce((acc, event) => {
    const partnerId = event.partner_id!
    if (!acc[partnerId]) {
      acc[partnerId] = { loads: 0, calculations: 0, cta_clicks: 0 }
    }
    if (event.event_type === "widget_load") acc[partnerId].loads++
    if (event.event_type === "widget_calculate") acc[partnerId].calculations++
    if (event.event_type === "widget_cta_click") acc[partnerId].cta_clicks++
    return acc
  }, {} as Record<string, { loads: number; calculations: number; cta_clicks: number }>)

  // Upsert daily aggregates for each partner
  for (const [partnerId, counts] of Object.entries(partnerGroups)) {
    await supabase.rpc("increment_widget_partner_stats", {
      p_partner_id: partnerId,
      p_date: today,
      p_loads: counts.loads,
      p_calculations: counts.calculations,
      p_cta_clicks: counts.cta_clicks,
    })
  }
}

// GET endpoint for retrieving partner analytics (admin/partner use)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const partnerId = searchParams.get("partner")
  const days = parseInt(searchParams.get("days") || "30")

  if (!partnerId) {
    return NextResponse.json({ error: "Partner ID required" }, { status: 400 })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from("widget_partner_daily_stats")
      .select("*")
      .eq("partner_id", partnerId)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false })

    if (error) throw error

    // Calculate totals
    const totals = (data || []).reduce(
      (acc, row) => ({
        total_loads: acc.total_loads + (row.loads || 0),
        total_calculations: acc.total_calculations + (row.calculations || 0),
        total_cta_clicks: acc.total_cta_clicks + (row.cta_clicks || 0),
      }),
      { total_loads: 0, total_calculations: 0, total_cta_clicks: 0 }
    )

    return NextResponse.json({
      partner_id: partnerId,
      period_days: days,
      daily_stats: data || [],
      totals,
      conversion_rate: totals.total_loads > 0 
        ? ((totals.total_calculations / totals.total_loads) * 100).toFixed(2) 
        : "0.00",
    })
  } catch (error) {
    console.error("Partner analytics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

