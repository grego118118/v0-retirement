"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Find all h2 and h3 elements in the blog content
    const article = document.querySelector(".blog-content")
    if (!article) return

    const elements = Array.from(article.querySelectorAll("h2, h3"))

    // Create IDs for headings that don't have them
    elements.forEach((el, index) => {
      if (!el.id) {
        el.id = `heading-${index}`
      }
    })

    // Extract heading data
    const headingData = elements.map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: el.tagName === "H2" ? 2 : 3,
    }))

    setHeadings(headingData)

    // Set up intersection observer to highlight active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "0px 0px -80% 0px",
      },
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  if (headings.length < 3) return null

  return (
    <div className="hidden lg:block sticky top-24 self-start ml-8 max-w-xs">
      <div className="bg-muted/30 p-4 rounded-lg border">
        <h4 className="font-medium mb-3">Table of Contents</h4>
        <nav>
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={cn(
                  "transition-colors",
                  heading.level === 3 && "ml-4",
                  activeId === heading.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
