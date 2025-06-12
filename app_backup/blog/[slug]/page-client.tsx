"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ReadingProgress } from "@/components/blog/reading-progress"

interface BlogPostClientProps {
  children: React.ReactNode
  post: any
  relatedPosts: any[]
}

export default function BlogPostClient({ children, post, relatedPosts }: BlogPostClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {mounted && <ReadingProgress />}
      {children}
    </>
  )
}
