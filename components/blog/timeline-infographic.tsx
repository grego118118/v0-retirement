"use client"

import React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TimelineEvent {
  date: string
  title: string
  description: string
  icon: React.ReactNode
  color?: string
}

interface TimelineProps {
  title: string
  description?: string
  events: TimelineEvent[]
  className?: string
}

export function TimelineInfographic({ title, description, events, className }: TimelineProps) {
  const [expanded, setExpanded] = React.useState(false)

  // Show only first 3 events when collapsed
  const visibleEvents = expanded ? events : events.slice(0, 3)

  return (
    <div className={cn("my-8 rounded-xl border bg-card p-6 shadow-sm", className)}>
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[24px] top-0 h-full w-[2px] bg-muted" />

        {/* Timeline events */}
        <div className="space-y-8">
          {visibleEvents.map((event, index) => (
            <div key={index} className="relative flex gap-4">
              <div
                className={cn(
                  "z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2",
                  event.color || "border-primary bg-primary/10 text-primary",
                )}
              >
                {event.icon}
              </div>

              <div className="flex-1 pt-1">
                <p className="font-medium text-sm text-muted-foreground">{event.date}</p>
                <h4 className="text-lg font-semibold">{event.title}</h4>
                <p className="mt-1 text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Show more/less button */}
        {events.length > 3 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setExpanded(!expanded)} className="gap-2">
              {expanded ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
